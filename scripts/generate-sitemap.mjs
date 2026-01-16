import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const distDir = path.join(root, 'dist')
const postsDir = path.join(root, 'src', 'posts', 'posts')

const siteUrl = (process.env.SITE_URL || 'https://example.com').replace(/\/$/, '')
const basePathRaw = process.env.SITE_BASE || ''
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
