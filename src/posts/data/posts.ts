import type {DefineComponent} from 'vue'
import postsIndex from '@/posts/posts-index.json'

export type Post = {
    slug: string
    title: string
    date: string
    excerpt: string
    cover?: string
    component: DefineComponent
}

type PostsIndexItem = Omit<Post, 'component'>

const modules = import.meta.glob('/src/posts/posts/*.md', {
    eager: true
}) as Record<string, {default: DefineComponent}>

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
        component: componentBySlug.get(item.slug) as DefineComponent
    }))
    .filter((item) => item.component)
