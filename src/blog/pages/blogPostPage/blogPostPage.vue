<template>
  <div
    id="page"
    class="blog-post"
  >
    <div class="wrapp">
      <div class="content">
        <router-link
          class="blog-back"
          to="/blog"
        >
          Back to blog
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
          <p>That page is not available. Pick another entry from the blog list.</p>
          <router-link to="/blog">
            Go to blog index
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, watchEffect} from 'vue'
import {useRoute} from 'vue-router'
import {BLOG_POSTS} from '@/blog/data/blogPosts'
import {usePageLoader} from '@/composables/usePageLoader'

const route = useRoute()

const slug = computed(() => String(route.params.slug ?? ''))
const post = computed(() => BLOG_POSTS.find((item) => item.slug === slug.value))

const formatDate = (value: string) => new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium'
}).format(new Date(value))

watchEffect(() => {
    if (post.value) {
        document.title = `${post.value.title} — Blog`
    } else {
        document.title = 'Post not found — Blog'
    }
})

usePageLoader('page', 100)
</script>

<style scoped lang="scss">
@use 'blogPostPage.styles';
</style>
