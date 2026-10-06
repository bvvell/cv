import fs from 'node:fs'
import path from 'node:path'

/**
 * Shared build-time environment resolution.
 *
 * Why: `generate-sitemap.mjs` and `generate-feed.mjs` both need to turn
 * `SITE_URL`/`VITE_SITE_URL`/`SITE_BASE` (env vars, with a `.env` fallback) into an
 * absolute base URL. Keeping one parser here stops the two scripts from drifting.
 */

/** Minimal `.env` parser (avoids adding `dotenv` for a build-only script). */
export const readEnvFile = (filePath) => {
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

/**
 * Resolves the canonical site base URL from env vars + `.env` files.
 *
 * @param {string} root Project root directory.
 * @param {{ artifact: string }} opts Name of what is being built, for the CI error.
 */
export const resolveSiteEnv = (root, {artifact}) => {
    const fileEnv = {
        ...readEnvFile(path.join(root, '.env')),
        ...readEnvFile(path.join(root, '.env.production')),
    }

    const resolvedSiteUrl = process.env.SITE_URL
        || process.env.VITE_SITE_URL
        || fileEnv.SITE_URL
        || fileEnv.VITE_SITE_URL

    // Why: the old fallback was `https://example.com`, so a missing SITE_URL shipped
    // a feed/sitemap pointing at a placeholder host without failing the build. Local
    // runs keep a usable default; CI must stop instead.
    if (!resolvedSiteUrl && process.env.CI) {
        throw new Error(
            `SITE_URL (or VITE_SITE_URL) must be set in CI: refusing to build a ${artifact} for a placeholder domain.`
        )
    }

    const siteUrl = (resolvedSiteUrl || 'http://localhost:4173').replace(/\/$/, '')
    const basePathRaw = process.env.SITE_BASE || fileEnv.SITE_BASE || ''
    const basePath = basePathRaw ? `/${basePathRaw.replace(/^\/|\/$/g, '')}` : ''
    const baseUrl = `${siteUrl}${basePath}`

    return {siteUrl, basePath, baseUrl}
}
