import {computed} from 'vue'
import {useRoute} from 'vue-router'
import {useHead} from '@unhead/vue'
import postsIndex from '@/modules/posts/posts-index.json'
import cvData from '@/data/cv.json'
import {ensureTrailingSlash} from '@/utils/url'
import {
    POST_LOCALES,
    htmlLang,
    indexPath,
    isPostLocale,
    ogLocale,
    otherLocale,
    postPath,
    postsCopy,
    type PostLocale
} from '@/modules/posts/data/locale'

type PostIndexItem = {
    slug: string
    locale: PostLocale
    title: string
    excerpt: string
    cover?: string
    date?: string
}

const POSTS = postsIndex as PostIndexItem[]

const findPost = (locale: PostLocale, slug: string) =>
    POSTS.find((item) => item.slug === slug && item.locale === locale)

const hasPost = (locale: PostLocale, slug: string) =>
    POSTS.some((item) => item.slug === slug && item.locale === locale)

/**
 * Configures document `<head>` for the whole site:
 * - title/description (route meta + post overrides)
 * - canonical + hreflang alternates + OpenGraph/Twitter cards
 * - JSON-LD (Person, WebSite, and optional ProfilePage / BlogPosting)
 *
 * Why: keep all head/SEO logic in one composable so `App.vue` stays minimal.
 */
export function useSiteHead() {
    const route = useRoute()

    // Posts carry a `locale` in their route meta (be/ru); the rest of the site is English.
    const postLocale = computed<PostLocale | null>(() => {
        const loc = route.meta?.locale
        return isPostLocale(loc) ? loc : null
    })

    const pageLang = computed(() => (postLocale.value ? htmlLang[postLocale.value] : 'en'))

    const isPostPage = computed(
        () => route.name === 'posts-post' || route.name === 'posts-ru-post'
    )
    const isPostsIndex = computed(
        () => route.name === 'posts' || route.name === 'posts-ru'
    )

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

        // `/posts/:slug` (be) and `/posts/ru/:slug` (ru) get their own title/description/cover.
        if (isPostPage.value) {
            const locale = postLocale.value ?? 'be'
            const copy = postsCopy[locale]
            const slug = String(route.params?.slug ?? '')
            const post = findPost(locale, slug)
            const postUrlPath = postPath(locale, slug)

            if (post) {
                type = 'article'
                image = post.cover
                    ? (baseUrl.value ? `${baseUrl.value}${post.cover}` : post.cover)
                    : image

                const baseDescription = post.excerpt || description
                // If excerpt is too short, add a small “why click” hint for social previews.
                const descriptionForShare = baseDescription.length >= 110
                    ? baseDescription
                    : `${baseDescription} ${copy.shareHint}`

                return {
                    title: `${post.title} — ${copy.titleSuffix}`,
                    description: descriptionForShare,
                    url: baseUrl.value ? `${baseUrl.value}${postUrlPath}` : '',
                    image,
                    type
                }
            }

            return {
                title: copy.seoNotFoundTitle,
                description: copy.seoNotFoundDescription,
                url: baseUrl.value ? `${baseUrl.value}${postUrlPath}` : '',
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
            inLanguage: ['en', 'be', 'ru'],
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

        const breadcrumb = (items: {name: string; path: string}[]) => ({
            '@type': 'BreadcrumbList',
            itemListElement: items.map((entry, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: entry.name,
                item: base ? `${base}${entry.path}` : entry.path
            }))
        })

        if (route.name === 'cv') {
            ldGraph.push(breadcrumb([
                {name: 'Home', path: '/'},
                {name: 'CV', path: '/cv/'}
            ]))
        } else if (isPostsIndex.value) {
            const locale = postLocale.value ?? 'be'
            ldGraph.push(breadcrumb([
                {name: 'Home', path: '/'},
                {name: postsCopy[locale].eyebrow, path: indexPath[locale]}
            ]))
        } else if (isPostPage.value) {
            const locale = postLocale.value ?? 'be'
            const slug = String(route.params?.slug ?? '')
            const post = findPost(locale, slug)
            if (post) {
                ldGraph.push(breadcrumb([
                    {name: 'Home', path: '/'},
                    {name: postsCopy[locale].eyebrow, path: indexPath[locale]},
                    {name: post.title, path: postPath(locale, slug)}
                ]))

                const postUrl = base ? `${base}${postPath(locale, slug)}` : postPath(locale, slug)
                const postImage = post.cover
                    ? (base ? `${base}${post.cover}` : post.cover)
                    : fallbackImage.value
                ldGraph.push({
                    '@type': 'BlogPosting',
                    '@id': `${postUrl}#article`,
                    headline: post.title,
                    description: post.excerpt,
                    image: postImage,
                    datePublished: post.date,
                    inLanguage: htmlLang[locale],
                    author: {'@id': personId},
                    publisher: {'@id': personId},
                    mainEntityOfPage: {'@type': 'WebPage', '@id': postUrl},
                    isPartOf: {'@id': websiteId}
                })
            }
        }

        // hreflang alternates + og:locale:alternate for bilingual posts pages.
        const alternateLocales: {locale: PostLocale; path: string}[] = []
        if (isPostsIndex.value) {
            // Both index pages always exist.
            for (const locale of POST_LOCALES) {
                alternateLocales.push({locale, path: indexPath[locale]})
            }
        } else if (isPostPage.value) {
            const slug = String(route.params?.slug ?? '')
            for (const locale of POST_LOCALES) {
                if (hasPost(locale, slug)) {
                    alternateLocales.push({locale, path: postPath(locale, slug)})
                }
            }
        }

        const links: {rel: string; href: string; hreflang?: string}[] = []
        if (meta.url) {
            links.push({rel: 'canonical', href: meta.url})
        }
        // Only emit hreflang links when a real alternate exists (more than one locale).
        if (base && alternateLocales.length > 1) {
            for (const entry of alternateLocales) {
                links.push({rel: 'alternate', hreflang: htmlLang[entry.locale], href: `${base}${entry.path}`})
            }
            const fallback = alternateLocales.find((entry) => entry.locale === 'be') ?? alternateLocales[0]
            links.push({rel: 'alternate', hreflang: 'x-default', href: `${base}${fallback.path}`})
        }

        const metaTags = [
            {name: 'description', content: meta.description},
            {property: 'og:title', content: meta.title},
            {property: 'og:description', content: meta.description},
            {property: 'og:type', content: meta.type},
            {property: 'og:image', content: meta.image},
            {property: 'og:locale', content: postLocale.value ? ogLocale[postLocale.value] : 'en_US'},
            {name: 'twitter:card', content: meta.image ? 'summary_large_image' : 'summary'},
            {name: 'twitter:title', content: meta.title},
            {name: 'twitter:description', content: meta.description},
            {name: 'twitter:image', content: meta.image}
        ]

        // Declare the sibling language so social scrapers know a translation exists.
        if (postLocale.value && alternateLocales.length > 1) {
            metaTags.push({
                property: 'og:locale:alternate',
                content: ogLocale[otherLocale[postLocale.value]]
            })
        }

        if (meta.url) {
            metaTags.push({property: 'og:url', content: meta.url})
        }

        return {
            title: meta.title,
            htmlAttrs: {
                lang: pageLang.value
            },
            link: links,
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
