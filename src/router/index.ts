import {homePage} from '@/home/pages'
import {CVPage} from '@/cv/pages'
import {NotFoundPage} from '@/notFound/pages'
import {PostsIndexPage, PostsPostPage} from '@/posts/pages'

declare module 'vue-router' {
    interface RouteMeta {
        title?: string
        description?: string
    }
}

export const routes = [
    {
        path: '/',
        name: 'home',
        component: homePage,
        meta: {
            title: 'Uladzimir Biarnatski - HTML coder / Front-end developer',
            description: 'Front-end developer. CV, selected work, and short posts.'
        }
    },
    {
        path: '/cv',
        name: 'cv',
        component: CVPage,
        meta: {
            title: 'Uladzimir Biarnatski — CV',
            description: 'Experience, skills, and education.'
        }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFoundPage,
        meta: {
            title: '404 — Uladzimir Biarnatski',
            description: 'Page not found.'
        }
    },
    {
        path: '/posts',
        name: 'posts',
        component: PostsIndexPage,
        meta: {
            title: 'Posts — Uladzimir Biarnatski',
            description: 'Short updates on design, frontend work, and small improvements.'
        }
    },
    {
        path: '/posts/:slug',
        name: 'posts-post',
        component: PostsPostPage,
        meta: {
            title: 'Posts — Uladzimir Biarnatski',
            description: 'A short post.'
        }
    }
]
