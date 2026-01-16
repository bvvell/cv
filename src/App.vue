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
import {POSTS} from '@/posts/data/posts'

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
  const description = (route.meta?.description as string) || 'Front-end developer.'
  const url = baseUrl.value ? `${baseUrl.value}${route.fullPath || '/'}` : ''
  let image = fallbackImage.value
  let type: 'website' | 'article' = 'website'

  if (route.name === 'posts-post') {
    const slug = String(route.params?.slug ?? '')
    const post = POSTS.find((item) => item.slug === slug)
    if (post) {
      type = 'article'
      image = post.cover && baseUrl.value ? `${baseUrl.value}${post.cover}` : image
      return {
        title: `${post.title} — Posts`,
        description: post.excerpt || description,
        url: baseUrl.value ? `${baseUrl.value}/posts/${slug}` : '',
        image,
        type
      }
    }
  }

  return {title, description, url, image, type}
})

useHead(() => {
  const meta = resolvedMeta.value
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
    meta: metaTags
  }
})
</script>

<style scoped>
#app {
  width: 100%;
  min-height: 100vh;
}

@media (max-width: 768px) {
  #app {
    min-height: 100svh;
    min-height: 100dvh;
  }
}
</style>
