import fs from 'node:fs'
import path from 'node:path'

/**
 * Verifies that the live site serves the build that was just uploaded.
 *
 * Why:
 * - The SFTP step reports success even when the host still serves the previous
 *   build, a parking page, or a partially uploaded tree.
 * - Every page asserts its own canonical URL, so a build made with the wrong
 *   `SITE_URL` fails here instead of quietly shipping links to another domain.
 * - Post routes are derived from the generated index, so a partial upload
 *   (the failure this guards against) cannot hide behind a hand-written list.
 */
const SITE_URL = (process.env.SITE_URL || 'https://bvvell.site').replace(/\/$/, '')
// Where to fetch from, when that is not the canonical host: lets the same checks
// run against a local `pnpm preview` before a domain is live.
const FETCH_BASE = (process.env.DEPLOY_CHECK_BASE_URL || SITE_URL).replace(/\/$/, '')
const ATTEMPTS = 6

const root = process.cwd()
const distDir = path.join(root, 'dist')
const indexPath = path.join(root, 'src', 'modules', 'posts', 'posts-index.json')

const expectedRevision = (() => {
    const versionFile = path.join(distDir, 'version.json')
    if (fs.existsSync(versionFile)) {
        return JSON.parse(fs.readFileSync(versionFile, 'utf8')).revision
    }
    return (process.env.GITHUB_SHA || '').toLowerCase()
})()

if (!/^[a-f0-9]{40}$/i.test(expectedRevision || '')) {
    throw new Error('Run `pnpm run deploy:metadata` first: no deployed revision to verify against.')
}

const posts = fs.existsSync(indexPath)
    ? JSON.parse(fs.readFileSync(indexPath, 'utf8'))
    : []

const postRoute = (post) => post.locale === 'ru'
    ? `/posts/ru/${post.slug}/`
    : `/posts/${post.slug}/`

// Every page carries its own canonical, so one marker per route covers both
// "is this the new build" and "was it built for the new domain".
const PAGE_ROUTES = [
    '/',
    '/cv/',
    '/posts/',
    '/posts/ru/',
    ...posts.map(postRoute)
]

const FILE_ROUTES = [
    ['/sitemap.xml', `<loc>${SITE_URL}/</loc>`],
    ['/robots.txt', `Sitemap: ${SITE_URL}/sitemap.xml`],
    ['/feed.xml', `${SITE_URL}/posts/`],
    ['/feed.ru.xml', `${SITE_URL}/posts/ru/`],
    ['/cv.pdf', '%PDF']
]

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchWithRetry = async (url) => {
    let lastError
    for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
        try {
            // The query string defeats any edge cache between CI and the host.
            const response = await fetch(`${url}?revision=${expectedRevision}`, {
                headers: {'cache-control': 'no-cache'},
                redirect: 'follow'
            })
            if (!response.ok) {
                throw new Error(`${url} returned HTTP ${response.status}`)
            }
            return response
        } catch (error) {
            lastError = error
            if (attempt < ATTEMPTS) await wait(attempt * 2_000)
        }
    }
    throw lastError
}

const expectText = async (url, expectedText) => {
    let lastText = ''
    let lastUrl = url
    for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
        const response = await fetchWithRetry(url)
        lastUrl = response.url
        lastText = await response.text()
        if (lastText.includes(expectedText)) return
        if (attempt < ATTEMPTS) await wait(attempt * 2_000)
    }
    const preview = lastText.slice(0, 240).replace(/\s+/g, ' ').trim()
    throw new Error(
        `${url} did not contain ${JSON.stringify(expectedText)}. `
        + `Final URL: ${lastUrl}. Response starts with: ${JSON.stringify(preview)}`
    )
}

const expectRevision = async (url) => {
    const response = await fetchWithRetry(url)
    const metadata = await response.json()
    if (metadata.revision !== expectedRevision) {
        throw new Error(
            `${url} serves revision ${metadata.revision ?? 'unknown'}, expected ${expectedRevision}.`
        )
    }
}

// The revision check comes first: when the upload did not land at all, one
// clear failure beats twenty confusing ones.
await expectRevision(`${FETCH_BASE}/version.json`)

for (const route of PAGE_ROUTES) {
    await expectText(`${FETCH_BASE}${route}`, `rel="canonical" href="${SITE_URL}${route}"`)
}

for (const [route, marker] of FILE_ROUTES) {
    await expectText(`${FETCH_BASE}${route}`, marker)
}

console.log(`verified ${FETCH_BASE} at revision ${expectedRevision} (${PAGE_ROUTES.length} pages, ${FILE_ROUTES.length} files)`)
