import fs from 'node:fs'
import path from 'node:path'

/**
 * Generates `dist/feed.xml` (RSS 2.0) from `posts-index.json`.
 *
 * Why:
 * - Static hosting needs a real file in `dist/`.
 * - Keep generation independent from the SSG step so it stays a fast, dependency-free script.
 */
const root = process.cwd()
const distDir = path.join(root, 'dist')
const indexPath = path.join(root, 'src', 'modules', 'posts', 'posts-index.json')

const readEnvFile = (filePath) => {
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
            env[key] = rawValue.replace(/^['"]|['"]$/g, '')
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
const basePath = basePathRaw ? `/${basePathRaw.replace(/^\/|\/$/g, '')}` : ''
const baseUrl = `${siteUrl}${basePath}`

const escapeXml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const posts = fs.existsSync(indexPath)
    ? JSON.parse(fs.readFileSync(indexPath, 'utf8'))
    : []

// Why: one feed per language so subscribers get a single-language stream.
// `be` keeps the canonical `/feed.xml`; `ru` lives at `/feed.ru.xml`.
const FEEDS = {
    be: {
        file: 'feed.xml',
        title: 'Нататкі — Uladzimir Biarnatski',
        description: 'Невялікія нататкі пра жыццё, творчасць і не толькі.',
        indexPath: '/posts/'
    },
    ru: {
        file: 'feed.ru.xml',
        title: 'Заметки — Uladzimir Biarnatski',
        description: 'Небольшие заметки о жизни, творчестве и не только.',
        indexPath: '/posts/ru/'
    }
}

const buildFeed = (locale, config) => {
    const sorted = posts
        .filter((post) => (post.locale || 'be') === locale)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const feedUrl = `${baseUrl}/${config.file}`
    const channelLink = `${baseUrl}${config.indexPath}`
    const lastBuildDate = sorted[0]
        ? new Date(sorted[0].date).toUTCString()
        : new Date().toUTCString()

    const items = sorted.map((post) => {
        const postPath = locale === 'ru' ? `/posts/ru/${post.slug}/` : `/posts/${post.slug}/`
        const link = `${baseUrl}${postPath}`
        const pubDate = new Date(post.date).toUTCString()
        const cover = post.cover ? `${baseUrl}${post.cover}` : ''
        const enclosure = cover
            ? `\n      <enclosure url="${escapeXml(cover)}" type="image/jpeg" length="0"/>`
            : ''
        return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.excerpt || '')}</description>${enclosure}
    </item>`
    }).join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <link>${escapeXml(channelLink)}</link>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(config.description)}</description>
    <language>${locale}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>
`
}

fs.mkdirSync(distDir, {recursive: true})
for (const [locale, config] of Object.entries(FEEDS)) {
    fs.writeFileSync(path.join(distDir, config.file), buildFeed(locale, config))
}
