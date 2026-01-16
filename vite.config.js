import path from 'path'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'
import markdownItHighlightjs from 'markdown-it-highlightjs'

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
            markdownItSetup: (md) => {
                md.use(markdownItHighlightjs)
            },
            frontmatter: true
        }),
    ],
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
