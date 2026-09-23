<template>
  <div
    ref="pageRef"
    class="home-page"
  >
    <PageShell>
      <div class="home">
        <div
          class="home__body"
          :lang="locale"
        >
          <div
            class="home__lang"
            role="group"
            :aria-label="copy.switchLabel"
          >
            <template
              v-for="(option, index) in HOME_LOCALES"
              :key="option"
            >
              <span
                v-if="index"
                class="home__lang-sep"
                aria-hidden="true"
              >·</span>
              <button
                type="button"
                class="home__lang-option"
                :class="{'home__lang-option--current': option === locale}"
                :aria-pressed="option === locale"
                @click="selectLocale(option)"
              >
                {{ langName(option) }}
              </button>
            </template>
          </div>

          <h1>{{ title }}</h1>

          <p
            class="home__role"
            lang="en"
          >
            <router-link :to="{name: RouteName.Cv}">
              {{ role }}
            </router-link>
          </p>

          <p class="home__meta">
            {{ copy.meta }}
          </p>

          <p
            class="home__value"
            lang="en"
          >
            {{ HOME_VALUE }}
          </p>

          <nav
            class="home__links"
            aria-label="Primary links"
          >
            <a
              href="/cv.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ copy.downloadCv }}
            </a>
            <a :href="`mailto:${SOCIAL_LINKS.email}?subject=Hi%20Uladzimir`">
              {{ SOCIAL_LINKS.email }}
            </a>
          </nav>

          <div class="home__social">
            <a
              :href="SOCIAL_LINKS.linkedin"
              target="_blank"
              rel="me noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              :href="SOCIAL_LINKS.telegram"
              target="_blank"
              rel="me noopener noreferrer"
            >
              Telegram
            </a>
            <a
              v-if="SOCIAL_LINKS.instagram"
              :href="SOCIAL_LINKS.instagram"
              target="_blank"
              rel="me noopener noreferrer"
            >
              Instagram
            </a>
            <a
              v-if="SOCIAL_LINKS.threads"
              :href="SOCIAL_LINKS.threads"
              target="_blank"
              rel="me noopener noreferrer"
            >
              Threads
            </a>
          </div>

          <p
            v-if="!notesLocale"
            class="home__notes-hint"
          >
            Beyond the CV, I write about cycling, photography, and small tools I build.
            The posts are in Belarusian.
            <router-link
              :to="{name: indexRouteName[DEFAULT_LOCALE]}"
              @click="trackEvent('home-notes-hint')"
            >
              Read them →
            </router-link>
          </p>

          <section
            v-if="notesLocale && latestPosts.length"
            class="home__notes"
            aria-labelledby="home-notes-title"
          >
            <h2
              id="home-notes-title"
              class="home__notes-title"
            >
              {{ postsCopy[notesLocale].eyebrow }}
            </h2>
            <ul class="home__notes-list">
              <li
                v-for="post in latestPosts"
                :key="post.slug"
              >
                <router-link
                  class="home__note"
                  :to="{name: postRouteName[notesLocale], params: {slug: post.slug}}"
                  @click="trackEvent('home-post-click', {slug: post.slug, locale: notesLocale})"
                >
                  <span class="home__note-title">{{ post.title }}</span>
                  <span class="home__note-date">{{ formatPostDate(notesLocale, post.date) }}</span>
                </router-link>
              </li>
            </ul>
            <router-link
              class="home__notes-all"
              :to="{name: indexRouteName[notesLocale]}"
              @click="trackEvent('home-all-posts', {locale: notesLocale})"
            >
              {{ postsCopy[notesLocale].allPosts }} →
            </router-link>
          </section>
        </div>

        <img
          class="home__avatar"
          src="/av.png"
          alt="Uladzimir Biarnatski"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        >
      </div>
    </PageShell>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useCvData} from '@/composables/useCvData'
import {usePageLoader} from '@/composables/usePageLoader'
import {RouteName} from '@/router/routeNames'
import {trackEvent} from '@/utils/analytics'
import PageShell from '@/components/PageShell.vue'
import postsIndex from '@/modules/posts/posts-index.json'
import {
  DEFAULT_LOCALE,
  authorName,
  formatPostDate,
  indexRouteName,
  postRouteName,
  postsCopy,
  type PostLocale
} from '@/modules/posts/data/locale'
import {
  EN_LANG_NAME,
  HOME_LOCALES,
  HOME_VALUE,
  detectHomeLocale,
  homeCopy
} from '@/modules/home/data/homeCopy'
import {readStoredLocale, storeLocale, type SiteLocale} from '@/utils/localePreference'

type PostsIndexItem = {
  slug: string
  locale: PostLocale
  title: string
  date: string
}

// Why: enough to show the site is alive without turning the landing page into a blog.
const LATEST_POSTS_LIMIT = 3

const cvData = useCvData()
const SOCIAL_LINKS = cvData.personal.contacts
const role = cvData.personal.homeSubtitle

// Why: the prerendered page is English — that is what Google indexes and what a
// recruiter opens from LinkedIn. The language is resolved after mount so readers who
// come from Threads get the page (and the notes) in a language they actually read.
const locale = ref<SiteLocale>('en')

onMounted(() => {
  // Why both: `languages` is the ordered preference list, `language` the single
  // browser UI language — older in-app browsers only expose the latter.
  locale.value = readStoredLocale() ?? detectHomeLocale(navigator.languages ?? [navigator.language])
})

const selectLocale = (next: SiteLocale) => {
  if (next === locale.value) return
  locale.value = next
  storeLocale(next)
  trackEvent('home-lang-switch', {to: next})
}

const langName = (option: SiteLocale) =>
  (option === 'en' ? EN_LANG_NAME : homeCopy[option].langName)

// Why the name is translated while the role above is not: a Belarusian reader who
// came from Threads knows the person, not the transliteration — the Latin spelling
// is for search and for recruiters, and it is what the English page keeps showing.
const title = computed(() =>
  (locale.value === 'en' ? cvData.personal.name : authorName[locale.value]))

const copy = computed(() => {
  if (locale.value === 'en') {
    return {
      meta: cvData.personal.homeMeta ?? '',
      downloadCv: 'Download CV',
      switchLabel: 'Language'
    }
  }
  return homeCopy[locale.value]
})

// Why the English page gets no list: the notes are not in a language that reader can
// read, and eight Belarusian titles say nothing to them. They get one line instead —
// a recruiter who only wants the CV loses nothing, and a curious one learns the notes
// exist at all, which the bare switcher above the name never told them.
const notesLocale = computed<PostLocale | null>(() => (locale.value === 'en' ? null : locale.value))

const latestPosts = computed(() => {
  const postLocale = notesLocale.value
  if (!postLocale) return []
  return (postsIndex as PostsIndexItem[])
    .filter((item) => item.locale === postLocale)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, LATEST_POSTS_LIMIT)
})

const pageRef = ref<HTMLElement | null>(null)
usePageLoader(pageRef)
</script>

<style scoped lang="scss">
@use "homePage.styles";
</style>
