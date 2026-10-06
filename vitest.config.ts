import {fileURLToPath} from 'node:url'
import vue from '@vitejs/plugin-vue'
import {defineConfig} from 'vitest/config'

/**
 * Test runner config.
 *
 * Why a separate file and not `vite.config.js`: the app config loads the Markdown
 * and Shiki plugins plus the SSG post-processing plugin, none of which are needed
 * (and some of which are harmful) when running unit tests.
 *
 * Why `environment: 'node'` by default: most tests target pure functions. Files
 * that touch `window`/`localStorage` or mount components opt into jsdom with an
 * `// @vitest-environment jsdom` docblock at the top.
 */
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        environment: 'node',
        include: ['src/**/__tests__/**/*.test.ts'],
    },
})
