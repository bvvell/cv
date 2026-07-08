<template>
  <div
    ref="pageRef"
    class="posts-page"
  >
    <PageShell>
      <header class="posts-hero">
        <div class="posts-eyebrow-row">
          <p class="eyebrow">
            {{ copy.eyebrow }}
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
          <span
            class="posts-lang__current"
            aria-current="true"
          >
            {{ postsCopy[locale].langName }}
          </span>
          <span
            class="posts-lang__sep"
            aria-hidden="true"
          >·</span>
          <router-link
            class="posts-lang__link"
            :to="{name: indexRouteName[otherLocale[locale]]}"
            :hreflang="otherLocale[locale]"
          >
            {{ postsCopy[otherLocale[locale]].langName }}
          </router-link>
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
import {usePageLoader} from '@/composables/usePageLoader'
import {useCvData} from '@/composables/useCvData'
import PageShell from '@/components/PageShell.vue'
import postsIndex from '@/modules/posts/posts-index.json'
import {
  DEFAULT_LOCALE,
  dateLocale,
  indexRouteName,
  otherLocale,
  postRouteName,
  postsCopy,
  type PostLocale
} from '@/modules/posts/data/locale'

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

const formatDate = (value: string) => new Intl.DateTimeFormat(dateLocale[locale.value], {
  dateStyle: 'medium'
}).format(new Date(value))

const pageRef = ref<HTMLElement | null>(null)
usePageLoader(pageRef)
</script>

<style scoped lang="scss">
@use 'postsIndexPage.styles';
</style>
