<template>
  <div
    id="page"
    class="posts-page"
  >
    <div class="wrapp">
      <div class="content">
        <router-link
          class="posts-back"
          :to="{name: RouteName.Home}"
        >
          <svg
            class="posts-back__icon"
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M609.408 149.376 277.76 489.6a32 32 0 0 0 0 44.672l331.648 340.352a29.12 29.12 0 0 0 41.728 0 30.59 30.59 0 0 0 0-42.752L339.264 511.936l311.872-319.872a30.59 30.59 0 0 0 0-42.688 29.12 29.12 0 0 0-41.728 0"
            />
          </svg>
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
          <div
            v-if="SOCIAL_LINKS.instagram || SOCIAL_LINKS.threads"
            class="posts-socials"
          >
            <a
              v-if="SOCIAL_LINKS.instagram"
              :href="SOCIAL_LINKS.instagram"
              target="_blank"
              rel="me noopener noreferrer"
              aria-label="Instagram"
            >
              Instagram
            </a>
            <span
              v-if="SOCIAL_LINKS.instagram && SOCIAL_LINKS.threads"
              class="dot"
              aria-hidden="true"
            >
              •
            </span>
            <a
              v-if="SOCIAL_LINKS.threads"
              :href="SOCIAL_LINKS.threads"
              target="_blank"
              rel="me noopener noreferrer"
              aria-label="Threads"
            >
              Threads
            </a>
          </div>
        </header>
        <section class="posts-list">
          <article
            v-for="(post, index) in posts"
            :key="post.slug"
            class="post-card"
            :style="cardDelay(index)"
          >
            <h2>
              <router-link :to="{name: RouteName.PostsPost, params: {slug: post.slug}}">
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
// Why: list view reads the generated posts index and renders lightweight cards.
import {computed} from 'vue'
import {usePageLoader} from '@/composables/usePageLoader'
import {useCvData} from '@/composables/useCvData'
import postsIndex from '@/modules/posts/posts-index.json'
import {RouteName} from '@/router/routeNames'

const cvData = useCvData()
const SOCIAL_LINKS = cvData.personal.contacts

const posts = computed(() => {
  const items = postsIndex as {slug: string; title: string; date: string; excerpt: string}[]
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const formatDate = (value: string) => new Intl.DateTimeFormat('be-BY', {
  dateStyle: 'medium'
}).format(new Date(value))

const cardDelay = (index: number) => ({
  transitionDelay: `${150 + index * 80}ms`
})

usePageLoader('page')
</script>

<style scoped lang="scss">
@use 'postsIndexPage.styles';
</style>
