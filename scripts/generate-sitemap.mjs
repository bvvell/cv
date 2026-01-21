import fs from 'node:fs'
import path from 'node:path'

/**
 * Generates `dist/sitemap.xml`, `dist/robots.txt` and copies `.htaccess`.
 *
 * Why:
 * - Static hosting needs real files in `dist/` (no server-side sitemap generator).
 * - We derive routes from the Markdown posts folder to keep sitemap consistent with content.
 */
const root = process.cwd()
const distDir = path.join(root, 'dist')
const postsDir = path.join(root, 'src', 'modules', 'posts', 'posts')

const readEnvFile = (filePath) => {
  // Minimal `.env` parser (we avoid adding dotenv as a dependency for a build-only script).
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const env = {}
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const rawValue = trimmed.slice(idx + 1).trim()
      const value = rawValue.replace(/^['"]|['"]$/g, '')
      env[key] = value
    }
    return env
  } catch {
    return {}
  }
}

const fileEnv = {
  ...readEnvFile(path.join(root, '.env')),
  ...readEnvFile(path.join(root, '.env.production'))
}

const siteUrl = (
  process.env.SITE_URL
  || process.env.VITE_SITE_URL
  || fileEnv.SITE_URL
  || fileEnv.VITE_SITE_URL
  || 'https://example.com'
).replace(/\/$/, '')

const basePathRaw = process.env.SITE_BASE || fileEnv.SITE_BASE || ''
const basePath = basePathRaw
    ? `/${basePathRaw.replace(/^\/|\/$/g, '')}`
    : ''
const baseUrl = `${siteUrl}${basePath}`

const staticRoutes = ['/', '/cv', '/posts']
const postRoutes = fs.existsSync(postsDir)
    ? fs.readdirSync(postsDir)
        .filter((file) => file.endsWith('.md'))
        .map((file) => `/posts/${path.basename(file, '.md')}`)
    : []

const routes = Array.from(new Set([...staticRoutes, ...postRoutes]))

const toUrl = (route) => `${baseUrl}${route}`

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url><loc>${toUrl(route)}</loc></url>`).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml
`

fs.mkdirSync(distDir, {recursive: true})
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap)
fs.writeFileSync(path.join(distDir, 'robots.txt'), robots)

const htaccessSrc = path.join(root, 'public', '.htaccess')
const htaccessDest = path.join(distDir, '.htaccess')
if (fs.existsSync(htaccessSrc)) {
  fs.copyFileSync(htaccessSrc, htaccessDest)
}
