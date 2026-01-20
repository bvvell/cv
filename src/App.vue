<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useRoute} from 'vue-router'
import {useHead} from '@unhead/vue'
import {provideCvData} from '@/composables/useCvData'
import postsIndex from '@/posts/posts-index.json'
import cvData from '@/data/cv.json'

provideCvData()

const route = useRoute()

const baseUrl = computed(() => {
  const envUrl = import.meta.env.VITE_SITE_URL
  if (envUrl) {
    return envUrl.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '')
  }
  return ''
})

const fallbackImage = computed(() => {
  return baseUrl.value ? `${baseUrl.value}/av.png` : '/av.png'
})

const resolvedMeta = computed(() => {
  const title = (route.meta?.title as string) || 'Uladzimir Biarnatski'
  const description = (route.meta?.description as string)
    || 'Front-end developer focused on clean UI, responsive layouts, and Vue/TypeScript. CV, selected work, and short posts.'
  const url = baseUrl.value ? `${baseUrl.value}${route.fullPath || '/'}` : ''
  let image = fallbackImage.value
  let type: 'website' | 'article' = 'website'

  if (route.name === 'posts-post') {
    const slug = String(route.params?.slug ?? '')
    const post = (postsIndex as {slug: string; title: string; excerpt: string; cover?: string}[])
      .find((item) => item.slug === slug)
    if (post) {
      type = 'article'
      image = post.cover
        ? (baseUrl.value ? `${baseUrl.value}${post.cover}` : post.cover)
        : image
      const baseDescription = post.excerpt || description
      const descriptionForShare = baseDescription.length >= 110
        ? baseDescription
        : `${baseDescription} Поўны тэкст і прыклады — на маім сайце.`
      return {
        title: `${post.title} — Нататкі — Uladzimir Biarnatski`,
        description: descriptionForShare,
        url: baseUrl.value ? `${baseUrl.value}/posts/${slug}` : '',
        image,
        type
      }
    }
    return {
      title: 'Post not found — Posts — Uladzimir Biarnatski',
      description: 'Page not found.',
      url: baseUrl.value ? `${baseUrl.value}/posts/${slug}` : '',
      image,
      type: 'website'
    }
  }

  return {title, description, url, image, type}
})

useHead(() => {
  const meta = resolvedMeta.value
  const ldJson: unknown[] = []

  if (route.name === 'cv') {
    const base = baseUrl.value || ''
    const person = {
      '@type': 'Person',
      name: cvData.personal.name,
      jobTitle: cvData.personal.title,
      description: cvData.summary,
      email: `mailto:${cvData.personal.contacts.email}`,
      sameAs: [
        cvData.personal.contacts.linkedin,
        cvData.personal.contacts.telegram,
        cvData.personal.contacts.instagram,
        cvData.personal.contacts.threads
      ].filter(Boolean)
    }

    ldJson.push({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: `${cvData.personal.name} — CV`,
      url: base ? `${base}/cv` : undefined,
      mainEntity: person
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
    link: meta.url ? [{rel: 'canonical', href: meta.url}] : [],
    meta: metaTags,
    script: ldJson.length
      ? [{
        type: 'application/ld+json',
        children: JSON.stringify(ldJson.length === 1 ? ldJson[0] : ldJson)
      }]
      : []
  }
})
</script>
