/**
 * Posts registry: binds generated post metadata to the compiled Markdown components.
 *
 * Why:
 * - `scripts/generate-posts-index.mjs` creates `posts-index.json` (slug/locale/title/date/excerpt/cover).
 * - Vite compiles `/src/modules/posts/posts/**.md` to Vue components via `unplugin-vue-markdown`.
 * - This file merges the two so routing can resolve `/posts/:slug` (be) and `/posts/ru/:slug` (ru).
 */
import type {DefineComponent} from 'vue'
import postsIndex from '@/modules/posts/posts-index.json'
import {DEFAULT_LOCALE, type PostLocale} from '@/modules/posts/data/locale'

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
const beModules = import.meta.glob('/src/modules/posts/posts/*.md', {
    eager: true
}) as Record<string, {default: DefineComponent}>
const ruModules = import.meta.glob('/src/modules/posts/posts/ru/*.md', {
    eager: true
}) as Record<string, {default: DefineComponent}>

// Why: Vite's glob keys are full paths; we map them to the URL slug.
const extractSlug = (path: string) => {
    const match = path.match(/\/([^/]+)\.md$/)
    return match ? match[1] : path
}

const keyOf = (locale: PostLocale, slug: string) => `${locale}:${slug}`

const componentByKey = new Map<string, DefineComponent>([
    ...Object.entries(beModules).map(
        ([path, module]) => [keyOf('be', extractSlug(path)), module.default] as const
    ),
    ...Object.entries(ruModules).map(
        ([path, module]) => [keyOf('ru', extractSlug(path)), module.default] as const
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
