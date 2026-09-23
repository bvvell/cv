<template>
  <div
    ref="pageRef"
    class="posts-post"
  >
    <PageShell>
      <nav class="posts-top">
        <router-link
          class="posts-back"
          :to="backTarget"
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
          {{ cameFromHome ? copy.backHome : copy.backToList }}
        </router-link>
        <nav
          v-if="post && translationLocale"
          class="posts-lang"
          :aria-label="copy.switchLabel"
        >
          <span class="posts-lang__label">{{ copy.switchLabel }}:</span>
          <!-- Why a fixed order: the options stay put when the reader switches,
               so the language is where they last saw it. -->
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
              :to="{name: postRouteName[option], params: {slug: post.slug}}"
              :hreflang="option"
              @click="selectLocale(option, post.slug)"
            >
              {{ postsCopy[option].langName }}
            </router-link>
          </template>
        </nav>
      </nav>

      <div
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

        <PostFooter
          :locale="locale"
          :slug="post.slug"
        />
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

<script lang="ts">
// Survives the remount when the reader switches the language of the same post.
const postOrigin = {fromHome: false}
</script>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {useRoute} from 'vue-router'
import {RouteName} from '@/router/routeNames'
import {findPost, hasTranslation} from '@/modules/posts/data/posts'
import {usePageLoader} from '@/composables/usePageLoader'
import {trackEvent} from '@/utils/analytics'
import {storeLocale} from '@/utils/localePreference'
import PageShell from '@/components/PageShell.vue'
import {PostFooter} from '@/modules/posts/components'
import {
  DEFAULT_LOCALE,
  formatPostDate,
  indexRouteName,
  otherLocale,
  POST_LOCALES,
  postPath,
  postRouteName,
  postsCopy
} from '@/modules/posts/data/locale'
import type {PostLocale} from '@/modules/posts/data/locale'

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

// Why the switcher writes to storage: it is the same switcher as on the home page,
// and a reader who picks Russian over a post means it for the whole site, not just
// for this URL. The link itself still goes to the Russian version of this post.
const selectLocale = (next: PostLocale, postSlug: string) => {
    storeLocale(next)
    trackEvent('lang-switch', {from: locale.value, to: next, slug: postSlug, source: 'top'})
}

// Why: a reader who opened the post from the home page expects "back" to return there,
// not to a list they have never seen. Vue Router keeps the previous path in
// `history.state.back`; it is read after mount so the prerendered HTML (list link)
// hydrates unchanged. Switching the language of the same post keeps the origin.
const cameFromHome = ref(false)
const readOrigin = () => {
  const back: unknown = (window.history.state as {back?: unknown} | null)?.back
  const fromTranslation = typeof back === 'string' && back === postPath(otherLocale[locale.value], slug.value)
  cameFromHome.value = fromTranslation ? postOrigin.fromHome : back === '/'
  postOrigin.fromHome = cameFromHome.value
}
// Post-to-post links reuse this component, so mount alone is not enough.
onMounted(readOrigin)
watch(() => route.fullPath, readOrigin)
const backTarget = computed(() =>
  cameFromHome.value ? {name: RouteName.Home} : {name: indexRouteName[locale.value]}
)

const formatDate = (value: string) => formatPostDate(locale.value, value)

const showKamniStats = computed(() => slug.value === 'kamni-200' && locale.value === 'be')

const pageRef = ref<HTMLElement | null>(null)
usePageLoader(pageRef)
</script>

<style scoped lang="scss">
@use 'postsPostPage.styles';
</style>
