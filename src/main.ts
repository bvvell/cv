import {ViteSSG} from 'vite-ssg'
import {lifeCalendar} from '@/posts/components'
import App from './App.vue'
import {routes} from './router'
import 'highlight.js/styles/github.css'
import './style.css'

export const createApp = ViteSSG(
    App,
    {routes},
    ({app}) => {
        app.component('LifeCalendar', lifeCalendar)
    }
)
