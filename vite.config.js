import fs from 'fs'
import path from 'path'
import {createRequire} from 'module'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

const require = createRequire(import.meta.url)
const vitePrerenderModule = require('vite-plugin-prerender')
const vitePrerender = vitePrerenderModule.default ?? vitePrerenderModule
const JSDOMRenderer = require('@prerenderer/renderer-jsdom')

const postsDirectory = path.resolve(__dirname, 'src/posts/posts')
const postRoutes = fs.existsSync(postsDirectory)
    ? fs.readdirSync(postsDirectory)
        .filter((file) => file.endsWith('.md'))
        .map((file) => `/posts/${path.basename(file, '.md')}`)
    : []

const prerenderRoutes = ['/', '/cv', '/posts', ...postRoutes]
const enablePrerender = process.env.PRERENDER !== '0' && process.env.PRERENDER !== 'false'

export default defineConfig({
    plugins: [
        vue(),
        enablePrerender
            ? vitePrerender({
                staticDir: path.join(__dirname, 'dist'),
                routes: prerenderRoutes,
                renderer: new JSDOMRenderer()
            })
            : null
    ].filter(Boolean),
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
        rollupOptions: {
            output: {
                manualChunks: {
                    'vue-vendor': ['vue', 'vue-router']
                }
            }
        },
        chunkSizeWarningLimit: 1000
    }
})
