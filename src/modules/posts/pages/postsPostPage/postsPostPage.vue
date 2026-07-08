<template>
  <div
    ref="pageRef"
    class="posts-post"
  >
    <PageShell>
      <nav class="posts-top">
        <router-link
          class="posts-back"
          :to="{name: indexRouteName[locale]}"
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
          {{ copy.backToList }}
        </router-link>
        <nav
          v-if="post && translationLocale"
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
            :to="{name: postRouteName[translationLocale], params: {slug: post.slug}}"
            :hreflang="translationLocale"
          >
            {{ postsCopy[translationLocale].langName }}
          </router-link>
        </nav>
      </nav>

      <div
        v-if="post"
        class="post-body"
      >
        <header class="post-header">
          <p class="post-meta">
            <span>{{ formatDate(post.date) }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ readingTime }}</span>
          </p>
          <h1>{{ post.title }}</h1>
          <p class="post-excerpt">
            {{ post.excerpt }}
          </p>
          <div
            v-if="showKamniStats"
            class="post-stats"
            aria-label="Кароткая статыстыка паездкі"
          >
            <div class="post-stats__item">
              <strong>209</strong>
              <span>кіламетраў</span>
            </div>
            <div class="post-stats__item">
              <strong>11</strong>
              <span>гадзін у сядле</span>
            </div>
            <div class="post-stats__item">
              <strong>+34°</strong>
              <span>на сонцы</span>
            </div>
          </div>
        </header>
        <article class="post-article">
          <component
            :is="post.component"
            class="post-content"
          />
        </article>
      </div>

      <div
        v-else
        class="post-missing"
      >
        <h1>{{ copy.notFoundTitle }}</h1>
        <p>{{ copy.notFoundText }}</p>
        <router-link :to="{name: indexRouteName[locale]}">
          {{ copy.toList }}
        </router-link>
      </div>
    </PageShell>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {useRoute} from 'vue-router'
import {findPost, hasTranslation} from '@/modules/posts/data/posts'
import {usePageLoader} from '@/composables/usePageLoader'
import PageShell from '@/components/PageShell.vue'
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
const locale = computed<PostLocale>(() => (route.meta.locale as PostLocale) || DEFAULT_LOCALE)
const copy = computed(() => postsCopy[locale.value])
const slug = computed(() => String(route.params.slug ?? ''))
const post = computed(() => findPost(locale.value, slug.value))

// Why: only offer the language switch when the other-language version exists.
const translationLocale = computed<PostLocale | null>(() => {
  const other = otherLocale[locale.value]
  return hasTranslation(slug.value, other) ? other : null
})

const formatDate = (value: string) => new Intl.DateTimeFormat(dateLocale[locale.value], {
  dateStyle: 'medium'
}).format(new Date(value))

const readingTime = computed(() => locale.value === 'ru' ? '6 мин чтения' : '6 хв чытання')
const showKamniStats = computed(() => slug.value === 'kamni-200' && locale.value === 'be')

const pageRef = ref<HTMLElement | null>(null)
usePageLoader(pageRef)
</script>

<style scoped lang="scss">
@use 'postsPostPage.styles';
</style>
