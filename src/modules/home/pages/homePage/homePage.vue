<template>
  <div
    ref="pageRef"
    class="home-page"
  >
    <PageShell>
      <div class="home">
        <div class="home__body">
          <h1>{{ HOME_TITLE }}</h1>

          <p class="home__role">
            <router-link :to="{name: RouteName.Cv}">
              {{ HOME_SUBTITLE }}
            </router-link>
          </p>

          <p class="home__meta">
            {{ HOME_META }}
          </p>

          <p class="home__value">
            Vue/TypeScript · UI engineering · performance-first.
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
              Download CV
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
import {ref} from 'vue'
import {useCvData} from '@/composables/useCvData'
import {usePageLoader} from '@/composables/usePageLoader'
import {RouteName} from '@/router/routeNames'
import PageShell from '@/components/PageShell.vue'

const cvData = useCvData()
const HOME_TITLE = cvData.personal.name
const HOME_SUBTITLE = cvData.personal.homeSubtitle
const HOME_META = cvData.personal.homeMeta ?? ''
const SOCIAL_LINKS = cvData.personal.contacts

const pageRef = ref<HTMLElement | null>(null)
usePageLoader(pageRef)
</script>

<style scoped lang="scss">
@use "homePage.styles";
</style>
