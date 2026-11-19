import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

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

/** Dev server only: deep links of the two React apps fall back to their own index.html. */
function spaFallback(bases: string[]): Plugin {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url ?? '/'
        const base = bases.find((b) => url === b || url.startsWith(`${b}/`))
        if (base && !url.includes('.') && !url.startsWith(`${base}/@`)) req.url = `${base}/index.html`
        next()
      })
    },
  }
}

/**
 * Build and dev: replaces `<!-- partial:name -->` in the static pages with `src/partials/name.html`,
 * and marks the menu link of the current page with aria-current="page".
 */
function htmlPartials(): Plugin {
  return {
    name: 'html-partials',
    transformIndexHtml(html, ctx) {
      const page = ctx.path.replace(/index\.html$/, '')
      return html.replace(/<!--\s*partial:([\w-]+)\s*-->/g, (_match, name: string) => {
        const partial = readFileSync(resolve(root, 'src/partials', `${name}.html`), 'utf8')
        return partial.replace(`<li><a href="${page}">`, `<li><a href="${page}" aria-current="page">`)
      })
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
  plugins: [react(), htmlPartials(), preloadFonts(), spaFallback(['/play', '/admin'])],
  resolve: {
    alias: { '@': resolve(root, 'src') },
  },
  build: {
    rollupOptions: { input: htmlEntries() },
  },
})
