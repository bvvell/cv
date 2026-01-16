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
import {computed, watchEffect} from 'vue'
import {useRoute} from 'vue-router'
import {POSTS} from '@/posts/data/posts'
import {usePageLoader} from '@/composables/usePageLoader'

const route = useRoute()

const slug = computed(() => String(route.params.slug ?? ''))
const post = computed(() => POSTS.find((item) => item.slug === slug.value))

const formatDate = (value: string) => new Intl.DateTimeFormat('be-BY', {
  dateStyle: 'medium'
}).format(new Date(value))

watchEffect(() => {
  if (post.value) {
    document.title = `${post.value.title} — Posts`
  } else {
    document.title = 'Post not found — Posts'
  }
})

usePageLoader('page', 100)
</script>

<style scoped lang="scss">
@use 'postsPostPage.styles';
</style>
