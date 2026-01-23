import fs from 'fs'
import path from 'path'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'

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
    ? postsIndex.map((post) => `/posts/${post.slug}`)
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
            frontmatter: true
        }),
    ],
    ssgOptions: {
        dirStyle: 'nested',
        includedRoutes() {
            // Keep the list explicit to avoid accidentally generating unwanted routes.
            const staticRoutes = ['/', '/cv', '/posts']
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
        // Why: PSI flags multiple small CSS files as render-blocking; keeping a single CSS bundle
        // reduces the number of blocking requests during initial paint.
        cssCodeSplit: false,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    return id.includes('node_modules') ? 'vendor' : undefined
                }
            }
        },
        chunkSizeWarningLimit: 1000
    }
}))
