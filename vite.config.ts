import { readdirSync, statSync } from 'node:fs'
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

// https://vite.dev/config/
export default defineConfig({
  appType: 'mpa',
  plugins: [react(), spaFallback(['/play', '/admin'])],
  resolve: {
    alias: { '@': resolve(root, 'src') },
  },
  build: {
    rollupOptions: { input: htmlEntries() },
  },
})
