import {ViteSSG} from 'vite-ssg'
import {lifeCalendar} from '@/posts/components'
import App from './App.vue'
import {routes} from './router'
import './style.css'
import '@/posts/styles/postsCommon.scss'

export const createApp = ViteSSG(
    App,
    {routes},
    ({app}) => {
        app.component('LifeCalendar', lifeCalendar)
    }
)
