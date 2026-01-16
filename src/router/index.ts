import {createRouter, createWebHistory} from 'vue-router'
import {homePage} from '@/home/pages'
import {CVPage} from '@/cv/pages'
import {NotFoundPage as notFoundPage} from '@/notFound/pages'

declare module 'vue-router' {
    interface RouteMeta {
        title?: string
    }
}

const routes = [
    {
        path: '/',
        name: 'home',
        component: homePage,
        meta: {title: 'Uladzimir Biarnatski - HTML coder / Front-end developer'}
    },
    {
        path: '/cv',
        name: 'cv',
        component: CVPage,
        meta: {title: 'Uladzimir Biarnatski — CV'}
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: notFoundPage,
        meta: {title: '404 — Uladzimir Biarnatski'}
    }
]

const router = createRouter({
    history: createWebHistory('/'),
    routes
})

router.beforeEach((to, _from, next) => {
    document.title = to.meta.title || 'Uladzimir Biarnatski'
    next()
})

export default router
