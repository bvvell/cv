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
            rel="noopener"
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
            rel="noopener"
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
import {computed} from 'vue'
import {useRoute} from 'vue-router'
import {POSTS} from '@/posts/data/posts'
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
