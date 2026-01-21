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
    ({app}) => {
        app.component('LifeCalendar', lifeCalendar)
    }
)
