import fs from 'fs'
import path from 'path'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'

const postsIndexPath = path.resolve(__dirname, 'src/posts/posts-index.json')
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
        chunkSizeWarningLimit: 1000
    }
}))
