/**
 * Posts registry: binds generated post metadata to the compiled Markdown components.
 *
 * Why:
 * - `scripts/generate-posts-index.mjs` creates `posts-index.json` (title/date/excerpt/cover).
 * - Vite compiles `/src/modules/posts/posts/*.md` to Vue components via `unplugin-vue-markdown`.
 * - This file merges the two so routing can resolve `/posts/:slug` to a component with meta.
 */
import type {DefineComponent} from 'vue'
import postsIndex from '@/modules/posts/posts-index.json'

export type Post = {
    slug: string
    title: string
    date: string
    excerpt: string
    cover?: string
    component: DefineComponent
}

type PostsIndexItem = Omit<Post, 'component'>

const modules = import.meta.glob('/src/modules/posts/posts/*.md', {
    eager: true
}) as Record<string, {default: DefineComponent}>

// Why: Vite's glob keys are full paths; we map them to the URL slug (`/posts/:slug`).
const extractSlug = (path: string) => {
    const match = path.match(/\/([^/]+)\.md$/)
    return match ? match[1] : path
}

const moduleEntries = Object.entries(modules).map(([path, module]) => ({
    slug: extractSlug(path),
    component: module.default
}))

const componentBySlug = new Map(moduleEntries.map((entry) => [entry.slug, entry.component]))

export const POSTS: Post[] = (postsIndex as PostsIndexItem[])
    .map((item) => ({
        ...item,
        // Why: posts without a matching compiled component should not render.
        component: componentBySlug.get(item.slug) as DefineComponent
    }))
    .filter((item) => item.component)
