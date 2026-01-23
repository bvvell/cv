/**
 * App entry point (Vite + ViteSSG).
 *
 * Why:
 * - We use `vite-ssg` to pre-render routes into static HTML in `dist/`.
 * - Markdown posts compile into Vue components; `LifeCalendar` is registered globally so posts can use it without local imports.
 * - Global styles are imported here once to keep components focused.
 */
import {ViteSSG} from 'vite-ssg'
import {lifeCalendar} from '@/modules/posts/components'
import App from './App.vue'
import {routes} from './router'
import './style.scss'
import '@/modules/posts/styles/postsCommon.scss'

export const createApp = ViteSSG(
    App,
    {routes},
    ({app, router, isClient}) => {
        app.component('LifeCalendar', lifeCalendar)

        // Normalize client-side navigation to always include a trailing slash.
        if (isClient) {
            router.beforeEach((to) => {
                const normalized = ensureTrailingSlash(to.fullPath)
                if (normalized !== to.fullPath) return normalized
            })
        }
    }
)

function ensureTrailingSlash(fullPath: string) {
    const hashIndex = fullPath.indexOf('#')
    const beforeHash = hashIndex === -1 ? fullPath : fullPath.slice(0, hashIndex)
    const hash = hashIndex === -1 ? '' : fullPath.slice(hashIndex)

    const queryIndex = beforeHash.indexOf('?')
    const pathname = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex)
    const query = queryIndex === -1 ? '' : beforeHash.slice(queryIndex)

    if (pathname === '/' || pathname.endsWith('/')) return fullPath
    // Skip paths that look like files (e.g. /cv.pdf, /sitemap.xml).
    if (/\.[^/]+$/.test(pathname)) return fullPath
    return `${pathname}/${query}${hash}`
}
