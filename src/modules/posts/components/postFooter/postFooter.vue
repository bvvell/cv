<template>
  <footer class="post-footer">
    <section class="post-footer__author">
      <img
        class="post-footer__avatar"
        src="/av.png"
        alt=""
        width="56"
        height="56"
        loading="lazy"
        decoding="async"
      >
      <div>
        <p class="post-footer__name">
          {{ name }}
        </p>
        <p
          class="post-footer__role"
          lang="en"
        >
          {{ role }}
        </p>
        <p class="post-footer__note">
          {{ copy.authorNote }}
        </p>
        <router-link
          class="post-footer__cv"
          :to="{name: RouteName.Cv}"
          @click="trackEvent('post-cv-click', {slug, locale})"
        >
          {{ copy.cvCta }} →
        </router-link>
      </div>
    </section>

    <section
      v-if="morePosts.length"
      class="post-footer__more"
    >
      <h2 class="post-footer__more-title">
        {{ copy.moreTitle }}
      </h2>
      <ul class="post-footer__list">
        <li
          v-for="item in morePosts"
          :key="item.slug"
        >
          <router-link
            class="post-footer__item"
            :to="{name: postRouteName[locale], params: {slug: item.slug}}"
            @click="trackEvent('post-next-click', {from: slug, to: item.slug})"
          >
            <span class="post-footer__item-title">{{ item.title }}</span>
            <span class="post-footer__item-date">{{ formatDate(item.date) }}</span>
          </router-link>
        </li>
      </ul>
      <p class="post-footer__links">
        <router-link :to="{name: indexRouteName[locale]}">
          {{ copy.allPosts }}
        </router-link>
        <span
          class="post-footer__dot"
          aria-hidden="true"
        >·</span>
        <a
          :href="feedPath[locale]"
          @click="trackEvent('rss-click', {locale})"
        >
          {{ copy.rssLabel }}
        </a>
      </p>
    </section>
  </footer>
</template>

<script setup lang="ts">
/**
 * End-of-post block: who wrote this, a link to the CV, and the next notes to read.
 *
 * Why: posts are where social traffic lands, and they used to end at the last
 * paragraph — every reader left from there instead of reaching the CV or another note.
 */
import {computed} from 'vue'
import {useCvData} from '@/composables/useCvData'
import {RouteName} from '@/router/routeNames'
import {trackEvent} from '@/utils/analytics'
import postsIndex from '@/modules/posts/posts-index.json'
import {
    authorName,
    feedPath,
    formatPostDate,
    indexRouteName,
    postRouteName,
    postsCopy,
    type PostLocale
} from '@/modules/posts/data/locale'

type PostsIndexItem = {
    slug: string
    locale: PostLocale
    title: string
    date: string
}

// How many neighbouring notes to offer; more than this reads as a sitemap.
const MORE_POSTS_LIMIT = 2

const props = defineProps<{
    locale: PostLocale
    slug: string
}>()

// The name follows the language of the post; the role line stays English, the way a
// job title is read in this trade — see `src/modules/home/data/homeCopy.ts`.
const name = computed(() => authorName[props.locale])
const role = useCvData().personal.homeSubtitle
const copy = computed(() => postsCopy[props.locale])

const morePosts = computed(() => (postsIndex as PostsIndexItem[])
    .filter((item) => item.locale === props.locale && item.slug !== props.slug)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, MORE_POSTS_LIMIT))

const formatDate = (value: string) => formatPostDate(props.locale, value)
</script>

<style scoped lang="scss">
@use 'postFooter.styles';
</style>
