<template>
  <div
    id="page"
    class="posts-post"
  >
    <div class="wrapp">
      <div class="content">
        <router-link
          class="posts-back"
          to="/posts"
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
          Назад да запісаў
        </router-link>
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
        <article
          v-if="post"
          class="post-body"
        >
          <header class="post-header">
            <p class="post-meta">
              <span>{{ formatDate(post.date) }}</span>
            </p>
            <h1>{{ post.title }}</h1>
            <p class="post-excerpt">
              {{ post.excerpt }}
            </p>
          </header>
          <component
            :is="post.component"
            class="post-content"
          />
        </article>
        <div
          v-else
          class="post-missing"
        >
          <h1>Запіс не знойдзены</h1>
          <p>Старонка недаступная. Абяры іншы запіс са спісу.</p>
          <router-link to="/posts">
            Да спісу запісаў
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Why: resolves the markdown component by slug and renders it as the post body.
import {computed} from 'vue'
import {useRoute} from 'vue-router'
import {POSTS} from '@/modules/posts/data/posts'
import {usePageLoader} from '@/composables/usePageLoader'
import {useCvData} from '@/composables/useCvData'

const route = useRoute()

const cvData = useCvData()
const SOCIAL_LINKS = cvData.personal.contacts

const slug = computed(() => String(route.params.slug ?? ''))
const post = computed(() => POSTS.find((item) => item.slug === slug.value))

const formatDate = (value: string) => new Intl.DateTimeFormat('be-BY', {
  dateStyle: 'medium'
}).format(new Date(value))

usePageLoader('page', 100)
</script>

<style scoped lang="scss">
@use 'postsPostPage.styles';
</style>
