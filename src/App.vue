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
  const description = (route.meta?.description as string)
    || 'Front-end developer focused on clean UI, responsive layouts, and Vue/TypeScript. CV, selected work, and short posts.'
  const url = baseUrl.value ? `${baseUrl.value}${route.fullPath || '/'}` : ''
  let image = fallbackImage.value
  let type: 'website' | 'article' = 'website'

  if (route.name === 'posts-post') {
    const slug = String(route.params?.slug ?? '')
    const post = POSTS.find((item) => item.slug === slug)
    if (post) {
      type = 'article'
      image = post.cover && baseUrl.value ? `${baseUrl.value}${post.cover}` : image
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
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at 20% 10%, var(--color-home-glow) 0%, transparent 55%),
    linear-gradient(160deg, var(--color-home-bg) 0%, var(--color-home-bg-soft) 100%);
}

#app::before {
  content: '';
  position: absolute;
  width: 48vw;
  height: 48vw;
  right: -18vw;
  top: -12vw;
  background: radial-gradient(circle, rgb(var(--color-home-accent-rgb) / 0.12) 0%, transparent 65%);
  pointer-events: none;
  z-index: 0;
}

#app > * {
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  #app {
    min-height: 100svh;
    min-height: 100dvh;
  }
}
</style>
