import fs from 'fs'
import path from 'path'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'
import Shiki from '@shikijs/markdown-it'

async function listFilesRecursive(dir) {
    const entries = await fs.promises.readdir(dir, {withFileTypes: true})
    const files = await Promise.all(
        entries.map(async (entry) => {
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory()) return listFilesRecursive(fullPath)
            return [fullPath]
        })
    )
    return files.flat()
}

function escapeHtmlStyle(css) {
    // Prevent accidentally terminating the <style> tag.
    return css.replaceAll('</style', '<\\/style')
}

function buildStylePreloadTag(href) {
    return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">`
}

function buildNoscriptStylesheetTag(href) {
    return `<noscript><link rel="stylesheet" href="${href}"></noscript>`
}

function buildJsFlagTag() {
    return `<script>document.documentElement.classList.add('js')</script>`
}

function findEntryFromManifest(manifest) {
    const entries = Object.entries(manifest)
        .filter(([, value]) => value && value.isEntry)
        .map(([key, value]) => ({key, value}))
    if (entries.length === 0) return null
    // Prefer the `src/main.ts` entry if present; otherwise fall back to first entry.
    const preferred = entries.find((entry) => entry.key.includes('src/main.ts') || entry.value.src?.includes('src/main.ts'))
    return preferred ?? entries[0]
}

function ssgHtmlPerf({distDir = 'dist', criticalCssPath = 'src/critical.css'} = {}) {
    /** @type {import('vite').ResolvedConfig | null} */
    let resolvedConfig = null
    return {
        name: 'ssg-html-perf',
        apply: 'build',
        configResolved(config) {
            resolvedConfig = config
        },
        async closeBundle() {
            const outDir = resolvedConfig?.build?.outDir ? path.resolve(resolvedConfig.build.outDir) : path.resolve(distDir)
            const manifestCandidates = [
                path.join(outDir, '.vite/manifest.json'),
                path.join(outDir, 'manifest.json'),
            ]

            const manifestPath = manifestCandidates.find((candidate) => fs.existsSync(candidate))
            if (!manifestPath) return

            const manifestRaw = await fs.promises.readFile(manifestPath, 'utf8')
            const manifest = JSON.parse(manifestRaw)
            const entry = findEntryFromManifest(manifest)
            if (!entry) return

            const entryCss = Array.isArray(entry.value.css) ? entry.value.css : []
            const cssHrefs = entryCss.map((cssFile) => `/${cssFile}`)

            const criticalCssAbs = path.resolve(criticalCssPath)
            const criticalCss = await fs.promises.readFile(criticalCssAbs, 'utf8')
            const criticalStyleTag = `<style data-critical="true">${escapeHtmlStyle(criticalCss)}</style>`

            const htmlFiles = (await listFilesRecursive(outDir)).filter((file) => file.endsWith('.html'))

            // Optional: preload local woff2 fonts if present under `public/fonts`.
            const fontsDir = path.resolve('public/fonts')
            let fontPreloads = ''
            try {
                const fontFiles = (await listFilesRecursive(fontsDir))
                    .filter((file) => file.endsWith('.woff2'))
                    .slice(0, 2)
                    .map((file) => `/fonts/${path.basename(file)}`)
                if (fontFiles.length) {
                    fontPreloads = fontFiles
                        .map((href) => `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`)
                        .join('')
                }
            } catch {
                // no fonts directory; ignore
            }

            for (const htmlPath of htmlFiles) {
                let html = await fs.promises.readFile(htmlPath, 'utf8')

                // Mark JS-capable environment for non-essential enter transitions.
                if (!html.includes("document.documentElement.classList.add('js')")) {
                    html = html.replace('<head>', `<head>${buildJsFlagTag()}`)
                }

                // Ensure we have critical CSS (in addition to the full stylesheet loaded via preload+swap).
                if (!html.includes('data-critical="true"')) {
                    html = html.replace('</head>', `${fontPreloads}${criticalStyleTag}</head>`)
                }

                // Replace blocking stylesheets with preload+swap, plus noscript fallback.
                for (const href of cssHrefs) {
                    const stylesheetRe = new RegExp(`<link\\s+[^>]*rel=["']stylesheet["'][^>]*href=["']${href.replaceAll('/', '\\/')}["'][^>]*>`, 'g')
                    const preload = buildStylePreloadTag(href)
                    const noscript = buildNoscriptStylesheetTag(href)
                    if (stylesheetRe.test(html)) {
                        html = html.replace(stylesheetRe, `${preload}${noscript}`)
                    } else if (!html.includes(`href="${href}"`) && html.includes('</head>')) {
                        html = html.replace('</head>', `${preload}${noscript}</head>`)
                    }
                }

                await fs.promises.writeFile(htmlPath, html)
            }
        }
    }
}

/**
 * Vite config + SSG route discovery.
 *
 * Why:
 * - Posts are Markdown files compiled into Vue components at build time.
 * - For SSG we must know all routes up front, so we read `posts-index.json` and include `/posts/:slug` routes.
 */
const postsIndexPath = path.resolve(__dirname, 'src/modules/posts/posts-index.json')
const postsIndex = fs.existsSync(postsIndexPath)
    ? JSON.parse(fs.readFileSync(postsIndexPath, 'utf-8'))
    : []
const postRoutes = Array.isArray(postsIndex)
    ? postsIndex.map((post) => `/posts/${post.slug}/`)
    : []

export default defineConfig(() => ({
    plugins: [
        vue({
            include: [/\.vue$/, /\.md$/]
        }),
        Markdown({
            // We allow a small subset of “rich text” in posts.
            markdownItOptions: {
                html: true,
                linkify: true,
                typographer: true
            },
            async markdownItSetup(md) {
                const publicDir = path.resolve(__dirname, 'public')

                // Syntax highlighting for fenced code blocks. Why: posts may include
                // short code samples; Shiki runs at build time, so there is no runtime cost.
                // Dual themes emit CSS variables so the page picks the right palette under
                // `prefers-color-scheme: dark` via stylesheet rules.
                md.use(await Shiki({
                    themes: {
                        light: 'github-light',
                        dark: 'github-dark-dimmed'
                    },
                    defaultColor: 'light'
                }))

                // Why: posts may use either `![alt](url.jpg)` (markdown image tokens)
                // or raw HTML `<img>` inside `<figure>` (html_block/html_inline tokens).
                // We want both to auto-upgrade to `<picture>` with a `.webp` source when
                // a sibling `.webp` exists on disk. Authors who already hand-wrote
                // `<picture>` blocks should not get double-wrapping.
                const webpExistsFor = (src) => {
                    if (!src || !src.startsWith('/')) return null
                    const match = src.match(/^(.*)\.(jpe?g|png)$/i)
                    if (!match) return null
                    const webpUrl = `${match[1]}.webp`
                    const absolute = path.join(publicDir, webpUrl)
                    return fs.existsSync(absolute) ? webpUrl : null
                }

                const wrapStandaloneImgs = (html) => {
                    // Skip everything already inside <picture>...</picture>, then wrap bare <img>.
                    return html.replace(
                        /<picture[\s\S]*?<\/picture>|<img\b[^>]*>/gi,
                        (match) => {
                            if (match.startsWith('<picture')) return match
                            const srcMatch = match.match(/\bsrc=["']([^"']+)["']/i)
                            if (!srcMatch) return match
                            const webpUrl = webpExistsFor(srcMatch[1])
                            let imgTag = match
                            if (!/\bloading=/i.test(imgTag)) {
                                imgTag = imgTag.replace(/<img\b/i, '<img loading="lazy" decoding="async"')
                            }
                            if (!webpUrl) return imgTag
                            return `<picture><source srcset="${webpUrl}" type="image/webp">${imgTag}</picture>`
                        }
                    )
                }

                const defaultImage = md.renderer.rules.image
                md.renderer.rules.image = (tokens, idx, options, env, self) => {
                    const token = tokens[idx]
                    token.attrSet('loading', 'lazy')
                    token.attrSet('decoding', 'async')
                    const src = token.attrGet('src')
                    const webpUrl = webpExistsFor(src)
                    const img = defaultImage
                        ? defaultImage(tokens, idx, options, env, self)
                        : self.renderToken(tokens, idx, options)
                    if (!webpUrl) return img
                    return `<picture><source srcset="${webpUrl}" type="image/webp">${img}</picture>`
                }

                const wrapHtmlTokenRule = (ruleName) => {
                    const original = md.renderer.rules[ruleName]
                    md.renderer.rules[ruleName] = (tokens, idx, options, env, self) => {
                        if (original) return wrapStandaloneImgs(original(tokens, idx, options, env, self))
                        return wrapStandaloneImgs(tokens[idx].content)
                    }
                }
                wrapHtmlTokenRule('html_block')
                wrapHtmlTokenRule('html_inline')
            },
            frontmatter: true
        }),
        ssgHtmlPerf(),
    ],
    ssgOptions: {
        dirStyle: 'nested',
        includedRoutes() {
            // Keep the list explicit to avoid accidentally generating unwanted routes.
            const staticRoutes = ['/', '/cv/', '/posts/']
            return [...staticRoutes, ...postRoutes]
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern'
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    server: {
        port: 5173,
        open: true
    },
    build: {
        target: 'esnext',
        minify: 'esbuild',
        manifest: true,
        // Why: PSI flags multiple small CSS files as render-blocking; keeping a single CSS bundle
        // reduces the number of blocking requests during initial paint.
        cssCodeSplit: false,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Why: split vendor by library family for better long-term caching —
                    // Vue core and Vue Router rev independently from the rest.
                    if (!id.includes('node_modules')) return undefined
                    if (id.includes('/node_modules/vue-router/')) return 'router'
                    if (
                        id.includes('/node_modules/vue/')
                        || id.includes('/node_modules/@vue/')
                    ) return 'vue'
                    return 'vendor'
                }
            }
        },
        chunkSizeWarningLimit: 1000
    }
}))
