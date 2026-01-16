<template>
  <div
    id="page"
    class="blog-page"
  >
    <div class="wrapp">
      <div class="content">
        <router-link
          class="blog-back"
          to="/"
        >
          Back
        </router-link>
        <header class="blog-hero">
          <p class="eyebrow">
            Notes
          </p>
          <h1>Blog</h1>
          <p class="intro">
            Short updates on design, frontend work, and small improvements.
          </p>
        </header>
        <section class="blog-list">
          <article
            v-for="(post, index) in posts"
            :key="post.slug"
            class="post-card"
            :style="cardDelay(index)"
          >
            <p class="post-meta">
              <span>{{ formatDate(post.date) }}</span>
              <span v-if="post.readingTime">· {{ post.readingTime }}</span>
            </p>
            <h2>
              <router-link :to="`/blog/${post.slug}`">
                {{ post.title }}
              </router-link>
            </h2>
            <p class="excerpt">
              {{ post.excerpt }}
            </p>
          </article>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {usePageLoader} from '@/composables/usePageLoader'
import {BLOG_POSTS} from '@/blog/data/blogPosts'

const posts = computed(() => [...BLOG_POSTS].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
}))

const formatDate = (value: string) => new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium'
}).format(new Date(value))

const cardDelay = (index: number) => ({
    transitionDelay: `${150 + index * 80}ms`
})

usePageLoader('page', 100)
</script>

<style scoped lang="scss">
@use 'blogIndexPage.styles';
</style>
