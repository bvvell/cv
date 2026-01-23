import {computed} from 'vue'
import {useRoute} from 'vue-router'
import {useHead} from '@unhead/vue'
import postsIndex from '@/modules/posts/posts-index.json'
import cvData from '@/data/cv.json'

type PostIndexItem = {
    slug: string
    title: string
    excerpt: string
    cover?: string
}

/**
 * Configures document `<head>` for the whole site:
 * - title/description (route meta + post overrides)
 * - canonical + OpenGraph/Twitter cards
 * - JSON-LD (Person, WebSite, and optional ProfilePage)
 *
 * Why: keep all head/SEO logic in one composable so `App.vue` stays minimal.
 */
export function useSiteHead() {
    const route = useRoute()

    const ensureTrailingSlash = (fullPath: string) => {
        const hashIndex = fullPath.indexOf('#')
        const beforeHash = hashIndex === -1 ? fullPath : fullPath.slice(0, hashIndex)
        const hash = hashIndex === -1 ? '' : fullPath.slice(hashIndex)

        const queryIndex = beforeHash.indexOf('?')
        const pathname = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex)
        const query = queryIndex === -1 ? '' : beforeHash.slice(queryIndex)

        if (pathname === '/' || pathname.endsWith('/')) return fullPath
        if (/\.[^/]+$/.test(pathname)) return fullPath
        return `${pathname}/${query}${hash}`
    }

    const pageLang = computed(() => {
        // Posts are written in Belarusian; the rest of the site is in English.
        return String(route.name || '').startsWith('posts') ? 'be' : 'en'
    })

    const baseUrl = computed(() => {
        const envUrl = import.meta.env.VITE_SITE_URL
        if (envUrl) {
            return envUrl.replace(/\/$/, '')
        }
        // In the browser, fall back to the current origin.
        if (typeof window !== 'undefined') {
            return window.location.origin.replace(/\/$/, '')
        }
        // During SSG build we rely on `VITE_SITE_URL`.
        return ''
    })

    const fallbackImage = computed(() => {
        return baseUrl.value ? `${baseUrl.value}/av.png` : '/av.png'
    })

    const resolvedMeta = computed(() => {
        // Default route meta is defined in `src/router/index.ts` per page.
        const title = (route.meta?.title as string) || 'Uladzimir Biarnatski'
        const description = (route.meta?.description as string)
            || 'Front-end developer focused on clean UI, responsive layouts, and Vue/TypeScript. CV, selected work, and short posts.'
        const url = baseUrl.value ? `${baseUrl.value}${ensureTrailingSlash(route.fullPath || '/')}` : ''
        let image = fallbackImage.value
        let type: 'website' | 'article' = 'website'

        // `/posts/:slug` gets its own title/description/cover.
        if (route.name === 'posts-post') {
            const slug = String(route.params?.slug ?? '')
            const post = (postsIndex as PostIndexItem[]).find((item) => item.slug === slug)
            const postPath = `/posts/${slug}/`

            if (post) {
                type = 'article'
                image = post.cover
                    ? (baseUrl.value ? `${baseUrl.value}${post.cover}` : post.cover)
                    : image

                const baseDescription = post.excerpt || description
                // If excerpt is too short, add a small “why click” hint for social previews.
                const descriptionForShare = baseDescription.length >= 110
                    ? baseDescription
                    : `${baseDescription} Поўны тэкст і прыклады — на маім сайце.`

                return {
                    title: `${post.title} — Нататкі — Uladzimir Biarnatski`,
                    description: descriptionForShare,
                    url: baseUrl.value ? `${baseUrl.value}${postPath}` : '',
                    image,
                    type
                }
            }

            return {
                title: 'Запіс не знойдзены — Нататкі — Uladzimir Biarnatski',
                description: 'Старонка недаступная.',
                url: baseUrl.value ? `${baseUrl.value}${postPath}` : '',
                image,
                type: 'website'
            }
        }

        return {title, description, url, image, type}
    })

    useHead(() => {
        const meta = resolvedMeta.value
        const ldGraph: Record<string, unknown>[] = []
        const base = baseUrl.value
        const personId = base ? `${base}/#person` : '#person'
        const websiteId = base ? `${base}/#website` : '#website'

        const sameAs = [
            cvData.personal.contacts.linkedin,
            cvData.personal.contacts.telegram,
            cvData.personal.contacts.instagram,
            cvData.personal.contacts.threads
        ].filter(Boolean)

        ldGraph.push({
            '@id': personId,
            '@type': 'Person',
            name: cvData.personal.name,
            jobTitle: cvData.personal.homeSubtitle || cvData.personal.title,
            description: cvData.summary,
            email: `mailto:${cvData.personal.contacts.email}`,
            url: base || undefined,
            image: fallbackImage.value,
            sameAs,
            knowsAbout: [
                ...(cvData.skills?.items ?? []),
                ...(cvData.technologies?.items ?? [])
            ]
        })

        ldGraph.push({
            '@id': websiteId,
            '@type': 'WebSite',
            name: cvData.personal.name,
            url: base || undefined,
            inLanguage: ['en', 'be'],
            author: {'@id': personId},
            publisher: {'@id': personId}
        })

        if (route.name === 'cv') {
            ldGraph.push({
                '@id': base ? `${base}/cv/#profile` : '#profile',
                '@type': 'ProfilePage',
                name: `${cvData.personal.name} — CV`,
                url: base ? `${base}/cv/` : undefined,
                isPartOf: {'@id': websiteId},
                mainEntity: {'@id': personId}
            })
        }

        const metaTags = [
            {name: 'description', content: meta.description},
            {property: 'og:title', content: meta.title},
            {property: 'og:description', content: meta.description},
            {property: 'og:type', content: meta.type},
            {property: 'og:image', content: meta.image},
            {name: 'twitter:card', content: meta.image ? 'summary_large_image' : 'summary'},
            {name: 'twitter:title', content: meta.title},
            {name: 'twitter:description', content: meta.description},
            {name: 'twitter:image', content: meta.image}
        ]

        if (meta.url) {
            metaTags.push({property: 'og:url', content: meta.url})
        }

        return {
            title: meta.title,
            htmlAttrs: {
                lang: pageLang.value
            },
            link: meta.url ? [{rel: 'canonical', href: meta.url}] : [],
            meta: metaTags,
            script: [{
                type: 'application/ld+json',
                textContent: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@graph': ldGraph
                })
            }]
        }
    })
}
