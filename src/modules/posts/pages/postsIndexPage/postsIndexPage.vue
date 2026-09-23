<template>
  <div
    ref="pageRef"
    class="posts-page"
  >
    <PageShell>
      <header class="posts-hero">
        <div class="posts-eyebrow-row">
          <div class="posts-socials">
            <router-link :to="{name: RouteName.Home}">
              {{ copy.backHome }}
            </router-link>
            <span
              v-if="SOCIAL_LINKS.instagram || SOCIAL_LINKS.threads"
              class="posts-socials__dot"
              aria-hidden="true"
            >·</span>
            <a
              v-if="SOCIAL_LINKS.instagram"
              :href="SOCIAL_LINKS.instagram"
              target="_blank"
              rel="me noopener noreferrer"
            >
              Instagram
            </a>
            <span
              v-if="SOCIAL_LINKS.instagram && SOCIAL_LINKS.threads"
              class="posts-socials__dot"
              aria-hidden="true"
            >·</span>
            <a
              v-if="SOCIAL_LINKS.threads"
              :href="SOCIAL_LINKS.threads"
              target="_blank"
              rel="me noopener noreferrer"
            >
              Threads
            </a>
          </div>
        </div>
        <h1>{{ copy.listTitle }}</h1>
        <p class="intro">
          {{ copy.intro }}
        </p>
        <nav
          class="posts-lang"
          :aria-label="copy.switchLabel"
        >
          <span class="posts-lang__label">{{ copy.switchLabel }}:</span>
          <!-- Fixed order, same as over a post: options don't swap on switch. -->
          <template
            v-for="(option, index) in POST_LOCALES"
            :key="option"
          >
            <span
              v-if="index"
              class="posts-lang__sep"
              aria-hidden="true"
            >·</span>
            <span
              v-if="option === locale"
              class="posts-lang__current"
              aria-current="true"
            >
              {{ postsCopy[option].langName }}
            </span>
            <router-link
              v-else
              class="posts-lang__link"
              :to="{name: indexRouteName[option]}"
              :hreflang="option"
              @click="selectLocale(option)"
            >
              {{ postsCopy[option].langName }}
            </router-link>
          </template>
        </nav>
      </header>

      <section class="posts-list">
        <article
          v-for="(post, index) in posts"
          :key="post.slug"
          class="post-card"
        >
          <router-link
            class="post-card__link"
            :to="{name: postRouteName[locale], params: {slug: post.slug}}"
          >
            <p class="post-card__topline">
              <span class="post-card__number">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="post-card__date">{{ formatDate(post.date) }}</span>
            </p>
            <h2>{{ post.title }}</h2>
            <p class="excerpt">
              {{ post.excerpt }}
            </p>
          </router-link>
        </article>
      </section>
    </PageShell>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {useRoute} from 'vue-router'
import {RouteName} from '@/router/routeNames'
import {usePageLoader} from '@/composables/usePageLoader'
import {trackEvent} from '@/utils/analytics'
import {storeLocale} from '@/utils/localePreference'
import {useCvData} from '@/composables/useCvData'
import PageShell from '@/components/PageShell.vue'
import postsIndex from '@/modules/posts/posts-index.json'
import {
  DEFAULT_LOCALE,
  formatPostDate,
  indexRouteName,
  POST_LOCALES,
  postRouteName,
  postsCopy
} from '@/modules/posts/data/locale'
import type {PostLocale} from '@/modules/posts/data/locale'

const route = useRoute()
const cvData = useCvData()
const SOCIAL_LINKS = cvData.personal.contacts

const locale = computed<PostLocale>(() => (route.meta.locale as PostLocale) || DEFAULT_LOCALE)
const copy = computed(() => postsCopy[locale.value])

const posts = computed(() => {
  const items = postsIndex as {slug: string; locale: PostLocale; title: string; date: string; excerpt: string}[]
  return items
    .filter((item) => item.locale === locale.value)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// Same switcher, same meaning as on the home page and over a post: remember it.
const selectLocale = (next: PostLocale) => {
  storeLocale(next)
  trackEvent('lang-switch', {from: locale.value, to: next, source: 'index'})
}

const formatDate = (value: string) => formatPostDate(locale.value, value)

const pageRef = ref<HTMLElement | null>(null)
usePageLoader(pageRef)
</script>

<style scoped lang="scss">
@use 'postsIndexPage.styles';
</style>
