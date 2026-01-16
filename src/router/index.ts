import {createRouter, createWebHistory} from 'vue-router'

declare module 'vue-router' {
    interface RouteMeta {
        title?: string
    }
}

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/home/pages/homePage/homePage.vue'),
        meta: {title: 'Uladzimir Biarnatski - HTML coder / Front-end developer'}
    },
    {
        path: '/cv',
        name: 'cv',
        component: () => import('@/cv/pages/cvPage/cvPage.vue'),
        meta: {title: 'Uladzimir Biarnatski — CV'}
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/notFound/pages/notFoundPage/notFoundPage.vue'),
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
