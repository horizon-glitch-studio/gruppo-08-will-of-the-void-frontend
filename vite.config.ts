import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { createServer, defineConfig, type Plugin, type ViteDevServer } from 'vite'
import { siteLinks } from './src/shared/site-links.ts'

const root = import.meta.dirname
const SKIP = new Set(['node_modules', 'dist', 'public', 'src', 'docs', '.git', '.vscode', 'card-prototype'])

/** Collects every HTML page of the site (multi-page app): one build entry per page. */
function htmlEntries(dir = root): Record<string, string> {
  const entries: Record<string, string> = {}
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      if (!SKIP.has(name)) Object.assign(entries, htmlEntries(path))
    } else if (name.endsWith('.html')) {
      const key = relative(root, path)
        .replace(/\.html$/, '')
        .replace(/\\/g, '/')
      entries[key] = path
    }
  }
  return entries
}

/** Dev and preview servers: deep links of the two React apps fall back to their own index.html. */
function spaFallback(bases: string[]): Plugin {
  const middleware = (req: { url?: string }, _res: unknown, next: () => void) => {
    const url = req.url ?? '/'
    const base = bases.find((b) => url === b || url.startsWith(`${b}/`))
    if (base && !url.includes('.') && !url.startsWith(`${base}/@`)) req.url = `${base}/index.html`
    next()
  }
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

/**
 * Dev server only: an address that matches no page shows 404.html, as the production server must do.
 * Runs after Vite has looked for a real page (post hook), and only for page addresses (no file extension).
 */
function notFoundPage(): Plugin {
  return {
    name: 'not-found-page',
    configureServer(server) {
      return () => {
        server.middlewares.use((req, _res, next) => {
          const url = req.url ?? '/'
          if (req.method === 'GET' && req.headers.accept?.includes('text/html') && !url.split('?')[0].includes('.')) req.url = '/404.html'
          next()
        })
      }
    },
  }
}

/** Partials generated from data instead of read from src/partials. */
const generatedPartials: Record<string, () => string> = {
  'site-links': () => `<ul>\n${siteLinks.map(({ href, label }) => `  <li><a href="${href}">${label}</a></li>`).join('\n')}\n</ul>`,
}

/** Replaces every `<!-- partial:name -->` in the HTML, partials inside partials included. */
function insertPartials(html: string, depth = 0): string {
  if (depth > 5) throw new Error('html-partials: partials nested too deep')
  return html.replace(/<!--\s*partial:([\w-]+)\s*-->/g, (_match, name: string) => {
    const partial = generatedPartials[name]?.() ?? readFileSync(resolve(root, 'src/partials', `${name}.html`), 'utf8')
    return insertPartials(partial, depth + 1)
  })
}

/**
 * Build and dev: replaces `<!-- partial:name -->` in the static pages with `src/partials/name.html`
 * or with a generated partial, and marks the menu links of the current page (header and side menu) with aria-current="page".
 */
function htmlPartials(): Plugin {
  return {
    name: 'html-partials',
    transformIndexHtml(html, ctx) {
      const page = ctx.path.replace(/index\.html$/, '')
      return insertPartials(html).replaceAll(`<li><a href="${page}">`, `<li><a href="${page}" aria-current="page">`)
    },
  }
}

const CARDS_BLOCK = /<!-- cards:([\w-]+) -->/g

/**
 * Static pages: replaces `<!-- cards:ring -->` with the cards rendered by the React components (src/static/cards.tsx),
 * so the static site and the platform share one card markup and one stylesheet (card.css), with no React in the page.
 * Dev: the running server loads the module. Build: a private server in SSR mode, with the same mode and env (image host).
 */
function staticCards(): Plugin {
  let mode = 'development'
  let devServer: ViteDevServer | undefined
  let buildServer: Promise<ViteDevServer> | undefined

  const loader = () =>
    devServer ??
    (buildServer ??= createServer({
      configFile: false,
      root,
      mode,
      appType: 'custom',
      logLevel: 'error',
      plugins: [react()],
      resolve: { alias: { '@': resolve(root, 'src') } },
      server: { middlewareMode: true, hmr: false, ws: false },
      optimizeDeps: { noDiscovery: true, include: [] },
    }))

  return {
    name: 'static-cards',
    configResolved(config) {
      mode = config.mode
    },
    configureServer(server) {
      devServer = server
    },
    transformIndexHtml: {
      // Before Vite resolves the asset URLs of the page: the card back image goes through the normal pipeline
      order: 'pre',
      async handler(html) {
        if (!html.includes('<!-- cards:')) return html
        const server = await loader()
        const { renderCards } = (await server.ssrLoadModule('/src/static/cards.tsx')) as { renderCards: (block: string) => string }
        return html.replace(CARDS_BLOCK, (_, block: string) => renderCards(block))
      },
    },
    async closeBundle() {
      await (await buildServer)?.close()
    },
  }
}

/** Address of the published site: canonical links, link previews, sitemap and robots.txt. VITE_SITE_URL overrides it (for example, a custom domain). */
const DEFAULT_SITE_URL = 'https://willofthevoid.horizonglitchstudio.workers.dev'

/** Preview image for shared links, made by npm run og-image (public/, so the address has no hash). */
const OG_IMAGE = { path: '/og-image.jpg', width: 1200, height: 630, alt: 'The Will of the Void logo over the swirling Void' }

const NOINDEX = /<meta\s+name="robots"\s+content="noindex"/

/** A text taken from the HTML, for an attribute: it is already HTML (entities stay as they are), only quotes need escaping. */
const attribute = (text: string) => text.replaceAll('"', '&quot;')

/**
 * Build and dev: search engine and link preview tags in every page, from what the page already has.
 * og:title and og:description copy <title> and the meta description, so each text is written once.
 * Pages with noindex (404, /play, /admin) get no canonical link and stay out of the sitemap.
 * %SITE_URL% in a page (structured data) becomes the site address.
 * Build only: writes sitemap.xml and robots.txt.
 */
function seo(): Plugin {
  let site = DEFAULT_SITE_URL
  return {
    name: 'seo',
    configResolved(config) {
      site = (config.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '')
    },
    transformIndexHtml(html, ctx) {
      const title = /<title>([^<]*)<\/title>/.exec(html)?.[1]
      const description = /<meta\s+name="description"\s+content="([^"]*)"/.exec(html)?.[1]
      const indexed = !NOINDEX.test(html)
      const url = `${site}${ctx.path.replace(/index\.html$/, '')}`
      const meta = (key: 'name' | 'property', name: string, content: string) => ({ tag: 'meta', attrs: { [key]: name, content: attribute(content) }, injectTo: 'head' as const })
      const tags = [
        meta('name', 'theme-color', '#090618'),
        meta('property', 'og:type', 'website'),
        meta('property', 'og:site_name', 'Will of the Void'),
        meta('property', 'og:locale', 'en_US'),
        ...(title ? [meta('property', 'og:title', title)] : []),
        ...(description ? [meta('property', 'og:description', description)] : []),
        meta('property', 'og:image', `${site}${OG_IMAGE.path}`),
        meta('property', 'og:image:width', String(OG_IMAGE.width)),
        meta('property', 'og:image:height', String(OG_IMAGE.height)),
        meta('property', 'og:image:alt', OG_IMAGE.alt),
        meta('name', 'twitter:card', 'summary_large_image'),
        ...(indexed ? [{ tag: 'link', attrs: { rel: 'canonical', href: url }, injectTo: 'head' as const }, meta('property', 'og:url', url)] : []),
      ]
      return { html: html.replaceAll('%SITE_URL%', site), tags }
    },
    generateBundle() {
      const pages = Object.entries(htmlEntries())
        .filter(([, file]) => !NOINDEX.test(readFileSync(file, 'utf8')))
        .map(([key]) => `${site}/${key.replace(/(^|\/)index$/, '$1')}`)
        .sort()
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((page) => `  <url><loc>${page}</loc></url>`).join('\n')}\n</urlset>\n`
      const robots = `User-agent: *\nDisallow: /play/\nDisallow: /admin/\n\nSitemap: ${site}/sitemap.xml\n`
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots })
    },
  }
}

/** Font files loaded on every page: preloaded so the text does not switch font after the first paint. */
const PRELOAD_FONTS = ['exo-latin-wght-normal', 'cinzel-latin-wght-normal']

/**
 * Build only: adds <link rel="preload"> for the main font files to every page.
 * The file names have a hash, so they are read from the bundle.
 */
function preloadFonts(): Plugin {
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml(_html, ctx) {
      const files = Object.keys(ctx.bundle ?? {}).filter((file) => file.endsWith('.woff2') && PRELOAD_FONTS.some((font) => file.includes(font)))
      return files.map((file) => ({
        tag: 'link',
        attrs: { rel: 'preload', href: `/${file}`, as: 'font', type: 'font/woff2', crossorigin: '' },
        injectTo: 'head-prepend' as const,
      }))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  appType: 'mpa',
  plugins: [react(), htmlPartials(), staticCards(), seo(), preloadFonts(), spaFallback(['/play', '/admin']), notFoundPage()],
  resolve: {
    alias: { '@': resolve(root, 'src') },
  },
  build: {
    rollupOptions: { input: htmlEntries() },
  },
  // Preview on the dev port: the backend allows only the dev origin (CORS). Stop npm run dev before npm run preview
  preview: { port: 5173, strictPort: true },
})
