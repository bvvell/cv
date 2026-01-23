import {HomePage} from '@/modules/home/pages'
import {NotFoundPage} from '@/modules/notFound/pages'
import {RouteName} from './routeNames'

/**
 * Route table.
 *
 * Why:
 * - `route.meta.title/description` is the single source of truth for page-level SEO text.
 * - `src/composables/useSiteHead.ts` reads these meta fields to generate `<title>`, canonical, OG/Twitter, and JSON-LD.
 */
declare module 'vue-router' {
    interface RouteMeta {
        title?: string
        description?: string
    }
}

export const routes = [
    {
        path: '/',
        name: RouteName.Home,
        component: HomePage,
        meta: {
            title: 'Uladzimir Biarnatski — UI Engineer / Front-end Developer',
            description: 'Front-end developer with 9+ years of experience building responsive websites and modern web apps. CV, selected work, and short posts.'
        }
    },
    {
        path: '/cv',
        redirect: {name: RouteName.Cv}
    },
    {
        path: '/cv/',
        name: RouteName.Cv,
        pathToRegexpOptions: {strict: true},
        component: () => import('@/modules/cv/pages/cvPage/cvPage.vue'),
        meta: {
            title: 'Uladzimir Biarnatski — CV',
            description: 'Experience, skills, and education — Vue/TypeScript, responsive UI, performance, and real-world product work.'
        }
    },
    {
        path: '/posts',
        redirect: {name: RouteName.Posts}
    },
    {
        path: '/posts/',
        name: RouteName.Posts,
        pathToRegexpOptions: {strict: true},
        component: () => import('@/modules/posts/pages/postsIndexPage/postsIndexPage.vue'),
        meta: {
            title: 'Нататкі — Uladzimir Biarnatski',
            description: 'Невялікія нататкі пра жыццё, творчасць і не толькі.'
        }
    },
    {
        path: '/posts/:slug',
        redirect: (to) => ({
            name: RouteName.PostsPost,
            params: to.params,
            query: to.query,
            hash: to.hash
        })
    },
    {
        path: '/posts/:slug/',
        name: RouteName.PostsPost,
        pathToRegexpOptions: {strict: true},
        component: () => import('@/modules/posts/pages/postsPostPage/postsPostPage.vue'),
        meta: {
            title: 'Нататкі — Uladzimir Biarnatski',
            description: 'Нататка.'
        }
    },
    {
        path: '/:pathMatch(.*)*',
        name: RouteName.NotFound,
        component: NotFoundPage,
        meta: {
            title: '404 — Uladzimir Biarnatski',
            description: 'Page not found.'
        }
    }
]
