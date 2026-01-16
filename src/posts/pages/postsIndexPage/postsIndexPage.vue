<template>
  <div
    id="page"
    class="posts-page"
  >
    <div class="wrapp">
      <div class="content">
        <router-link
          class="posts-back"
          to="/"
        >
          Назад
        </router-link>
        <header class="posts-hero">
          <p class="eyebrow">
            Нататкі
          </p>
          <h1>Запісы</h1>
          <p class="intro">
            Невялікія нататкі пра жыццё, творчасць і не толькі.
          </p>
        </header>
        <section class="posts-list">
          <article
            v-for="(post, index) in posts"
            :key="post.slug"
            class="post-card"
            :style="cardDelay(index)"
          >
            <h2>
              <router-link :to="`/posts/${post.slug}`">
                {{ post.title }}
              </router-link>
            </h2>
            <p class="excerpt">
              {{ post.excerpt }}
            </p>
            <p class="post-meta">
              <span>{{ formatDate(post.date) }}</span>
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
import {POSTS} from '@/posts/data/posts'

const posts = computed(() => [...POSTS].sort((a, b) => {
  const dateA = new Date(a.date).getTime()
  const dateB = new Date(b.date).getTime()
  return dateB - dateA
}))

const formatDate = (value: string) => new Intl.DateTimeFormat('be-BY', {
  dateStyle: 'medium'
}).format(new Date(value))

const cardDelay = (index: number) => ({
  transitionDelay: `${150 + index * 80}ms`
})

usePageLoader('page', 100)
</script>

<style scoped lang="scss">
@use 'postsIndexPage.styles';
</style>
