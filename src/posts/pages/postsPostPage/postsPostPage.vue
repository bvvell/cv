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
          Back to posts
        </router-link>
        <article
          v-if="post"
          class="post-body"
        >
          <header class="post-header">
            <p class="post-meta">
              <span>{{ formatDate(post.date) }}</span>
              <span v-if="post.readingTime">· {{ post.readingTime }}</span>
            </p>
            <h1>{{ post.title }}</h1>
            <p class="post-excerpt">
              {{ post.excerpt }}
            </p>
          </header>
          <!-- Content comes from local data, so v-html is safe here. -->
          <div
            class="post-content"
            v-html="post.content"
          />
        </article>
        <div
          v-else
          class="post-missing"
        >
          <h1>Post not found</h1>
          <p>That page is not available. Pick another entry from the posts list.</p>
          <router-link to="/posts">
            Go to posts index
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

const formatDate = (value: string) => new Intl.DateTimeFormat('en-US', {
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
