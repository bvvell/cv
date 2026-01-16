import MarkdownIt from 'markdown-it'
import markdownItHighlightjs from 'markdown-it-highlightjs'

export type BlogPost = {
    slug: string
    title: string
    date: string
    excerpt: string
    readingTime?: string
    content: string
}

type FrontMatter = {
    title?: string
    date?: string
    excerpt?: string
    readingTime?: string
}

const markdown = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
}).use(markdownItHighlightjs)

const parseFrontMatter = (raw: string) => {
    if (!raw.startsWith('---')) {
        return {frontMatter: {}, body: raw}
    }

    const lines = raw.split(/\r?\n/)
    const frontMatter: FrontMatter = {}
    let bodyStartIndex = 0

    for (let i = 1; i < lines.length; i += 1) {
        const line = lines[i]
        if (line.trim() === '---') {
            bodyStartIndex = i + 1
            break
        }
        const [key, ...rest] = line.split(':')
        if (!key) {
            continue
        }
        const value = rest.join(':').trim()
        if (!value) {
            continue
        }
        if (key === 'title') {
            frontMatter.title = value
        } else if (key === 'date') {
            frontMatter.date = value
        } else if (key === 'excerpt') {
            frontMatter.excerpt = value
        } else if (key === 'readingTime') {
            frontMatter.readingTime = value
        }
    }

    const body = lines.slice(bodyStartIndex).join('\n').trim()
    return {frontMatter, body}
}

const extractSlug = (path: string) => {
    const match = path.match(/\/([^/]+)\.md$/)
    return match ? match[1] : path
}

const modules = import.meta.glob('/src/blog/posts/*.md', {
    eager: true,
    as: 'raw'
}) as Record<string, string>

export const BLOG_POSTS: BlogPost[] = Object.entries(modules)
    .map(([path, raw]) => {
        const slug = extractSlug(path)
        const {frontMatter, body} = parseFrontMatter(raw)

        return {
            slug,
            title: frontMatter.title ?? slug,
            date: frontMatter.date ?? '1970-01-01',
            excerpt: frontMatter.excerpt ?? '',
            readingTime: frontMatter.readingTime,
            content: markdown.render(body)
        }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
