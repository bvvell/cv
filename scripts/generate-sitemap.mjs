import fs from 'node:fs'
import path from 'node:path'
import {resolveSiteEnv} from './lib/site-env.mjs'

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

const {baseUrl} = resolveSiteEnv(root, {artifact: 'sitemap'})

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

// Why lastmod: post pages change on their publish date; every other page reflects the
// current build (CV copy, latest-posts list), so it gets today's date.
const dateByRoute = new Map()
for (const post of posts) {
    const route = postPath(post)
    const existing = dateByRoute.get(route)
    if (!existing || post.date > existing) dateByRoute.set(route, post.date)
}
const buildDate = new Date().toISOString().slice(0, 10)
const lastmodFor = (route) => dateByRoute.get(route) || buildDate

const toUrl = (route) => `${baseUrl}${route}`

const renderUrl = (route) => {
    const lastmod = lastmodFor(route)
    const alternates = alternatesFor(route)
    if (!alternates) {
        return `  <url><loc>${toUrl(route)}</loc><lastmod>${lastmod}</lastmod></url>`
    }
    const links = Object.entries(alternates)
        .map(([locale, path]) => `\n    <xhtml:link rel="alternate" hreflang="${locale}" href="${toUrl(path)}"/>`)
        .join('')
    const xDefault = alternates.be || Object.values(alternates)[0]
    return `  <url><loc>${toUrl(route)}</loc><lastmod>${lastmod}</lastmod>${links}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${toUrl(xDefault)}"/>\n  </url>`
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
