import {createRouter, createWebHistory} from 'vue-router'
import {homePage} from '@/home/pages'
import {CVPage} from '@/cv/pages'
import {NotFoundPage} from '@/notFound/pages'
import {PostsIndexPage, PostsPostPage} from '@/posts/pages'

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
        component: NotFoundPage,
        meta: {title: '404 — Uladzimir Biarnatski'}
    },
    {
        path: '/posts',
        name: 'posts',
        component: PostsIndexPage,
        meta: {title: 'Posts — Uladzimir Biarnatski'}
    },
    {
        path: '/posts/:slug',
        name: 'posts-post',
        component: PostsPostPage,
        meta: {title: 'Posts — Uladzimir Biarnatski'}
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
