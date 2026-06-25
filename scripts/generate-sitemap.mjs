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
const indexPath = path.join(root, 'src', 'modules', 'posts', 'posts-index.json')

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

const withTrailingSlash = (route) => {
  if (route === '/') return route
  return route.endsWith('/') ? route : `${route}/`
}

// Why: derive post routes (and their locale) from the generated index so the
// sitemap stays consistent with content and can emit hreflang alternates.
const posts = fs.existsSync(indexPath)
    ? JSON.parse(fs.readFileSync(indexPath, 'utf8'))
    : []

const postPath = (post) => post.locale === 'ru'
    ? `/posts/ru/${post.slug}/`
    : `/posts/${post.slug}/`

// Group translations by slug so paired posts cross-link via hreflang.
const localesBySlug = new Map()
for (const post of posts) {
  if (!localesBySlug.has(post.slug)) localesBySlug.set(post.slug, {})
  localesBySlug.get(post.slug)[post.locale] = postPath(post)
}

const indexAlternates = {be: '/posts/', ru: '/posts/ru/'}

const alternatesFor = (route) => {
  if (route === '/posts/' || route === '/posts/ru/') return indexAlternates
  for (const paths of localesBySlug.values()) {
    if (Object.values(paths).includes(route) && Object.keys(paths).length > 1) {
      return paths
    }
  }
  return null
}

const staticRoutes = ['/', '/cv/', '/posts/', '/posts/ru/']
const postRoutes = posts.map(postPath)

const routes = Array.from(new Set([...staticRoutes, ...postRoutes])).map(withTrailingSlash)

const toUrl = (route) => `${baseUrl}${route}`

const renderUrl = (route) => {
  const alternates = alternatesFor(route)
  if (!alternates) {
    return `  <url><loc>${toUrl(route)}</loc></url>`
  }
  const links = Object.entries(alternates)
      .map(([locale, path]) => `\n    <xhtml:link rel="alternate" hreflang="${locale}" href="${toUrl(path)}"/>`)
      .join('')
  const xDefault = alternates.be || Object.values(alternates)[0]
  return `  <url><loc>${toUrl(route)}</loc>${links}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${toUrl(xDefault)}"/>\n  </url>`
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes.map(renderUrl).join('\n')}
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
