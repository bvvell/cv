/**
 * Posts registry: binds generated post metadata to the compiled Markdown components.
 *
 * Why:
 * - `scripts/generate-posts-index.mjs` creates `posts-index.json` (slug/locale/title/date/excerpt/cover).
 * - Vite compiles `/src/modules/posts/posts/**.md` to Vue components via `unplugin-vue-markdown`.
 * - This file merges the two so routing can resolve `/posts/:slug` (be) and `/posts/ru/:slug` (ru).
 * - Components are lazy (async): bundling every post + Shiki into `postsPostPage` made a
 *   50 KB gzip chunk; each post now splits into its own chunk and loads on demand.
 */
import {defineAsyncComponent} from 'vue'
import type {DefineComponent} from 'vue'
import postsIndex from '@/modules/posts/posts-index.json'
import {DEFAULT_LOCALE} from '@/modules/posts/data/locale'
import type {PostLocale} from '@/modules/posts/data/locale'

export type Post = {
    slug: string
    locale: PostLocale
    title: string
    date: string
    excerpt: string
    cover?: string
    component: DefineComponent
}

type PostsIndexItem = Omit<Post, 'component'>

// Why: `*.md` does not cross `/`, so the be glob excludes files under `ru/`.
const beModules = import.meta.glob<{default: DefineComponent}>('/src/modules/posts/posts/*.md')
const ruModules = import.meta.glob<{default: DefineComponent}>('/src/modules/posts/posts/ru/*.md')

// Why: Vite's glob keys are full paths; we map them to the URL slug.
const extractSlug = (path: string) => {
    const match = path.match(/\/([^/]+)\.md$/)
    return match ? match[1] : path
}

const keyOf = (locale: PostLocale, slug: string) => `${locale}:${slug}`

// Why the explicit `.default` unwrap: the lazy glob loader resolves to a module,
// while `defineAsyncComponent` wants the component itself.
const toAsyncComponent = (loader: () => Promise<{default: DefineComponent}>) =>
    defineAsyncComponent(async () => (await loader()).default)

const componentByKey = new Map<string, DefineComponent>([
    ...Object.entries(beModules).map(
        ([path, loader]) => [keyOf('be', extractSlug(path)), toAsyncComponent(loader)] as const
    ),
    ...Object.entries(ruModules).map(
        ([path, loader]) => [keyOf('ru', extractSlug(path)), toAsyncComponent(loader)] as const
    )
])

export const POSTS: Post[] = (postsIndex as PostsIndexItem[])
    .map((item) => ({
        ...item,
        // Why: posts without a matching compiled component should not render.
        component: componentByKey.get(keyOf(item.locale, item.slug)) as DefineComponent
    }))
    .filter((item) => item.component)

const byDateDesc = (a: Post, b: Post) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()

export const getPostsByLocale = (locale: PostLocale) =>
    POSTS.filter((post) => post.locale === locale).sort(byDateDesc)

export const findPost = (locale: PostLocale, slug: string) =>
    POSTS.find((post) => post.locale === locale && post.slug === slug)

// Why: the language switcher only renders when a translation actually exists.
export const hasTranslation = (slug: string, locale: PostLocale) =>
    POSTS.some((post) => post.locale === locale && post.slug === slug)

export {DEFAULT_LOCALE}
export type {PostLocale}
