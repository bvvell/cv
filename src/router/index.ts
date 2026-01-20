import {homePage} from '@/home/pages'
import {NotFoundPage} from '@/notFound/pages'

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
            description: 'Front-end developer with 9+ years of experience building responsive websites and modern web apps. CV, selected work, and short posts.'
        }
    },
    {
        path: '/cv',
        name: 'cv',
        component: () => import('@/cv/pages/cvPage/cvPage.vue'),
        meta: {
            title: 'Uladzimir Biarnatski — CV',
            description: 'Experience, skills, and education — Vue/TypeScript, responsive UI, performance, and real-world product work.'
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
        component: () => import('@/posts/pages/postsIndexPage/postsIndexPage.vue'),
        meta: {
            title: 'Posts — Uladzimir Biarnatski',
            description: 'Short posts about design, frontend work, and small improvements — notes on building clean UI, performance, and everyday dev practice.'
        }
    },
    {
        path: '/posts/:slug',
        name: 'posts-post',
        component: () => import('@/posts/pages/postsPostPage/postsPostPage.vue'),
        meta: {
            title: 'Posts — Uladzimir Biarnatski',
            description: 'A short post.'
        }
    }
]
