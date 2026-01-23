<template>
  <div
    id="page"
    class="home-data"
  >
    <div class="wrapp">
      <div class="content home">
        <h1>{{ HOME_TITLE }}</h1>

        <h2 class="home-subtitle">
          <router-link to="/cv">
            {{ HOME_SUBTITLE }}
          </router-link>
        </h2>

        <p class="home__meta">
          {{ HOME_META }}
        </p>

        <p class="home__value">
          Vue/TypeScript • UI engineering • performance-first.
        </p>

        <nav
          class="home__links"
          aria-label="Primary links"
        >
          <a
            class="home__cta home__cta--primary"
            href="/cv.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download CV
          </a>
          <a
            class="home__cta home__cta--secondary"
            :href="`mailto:${SOCIAL_LINKS.email}?subject=Hi%20Uladzimir`"
          >
            Contact
          </a>
        </nav>

        <div class="contact">
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
          <router-link to="/posts">
            Posts
          </router-link>
        </div>
      </div>

      <img
        class="avatar"
        src="/av.png"
        alt="Uladzimir Biarnatski"
        loading="eager"
        fetchpriority="high"
        decoding="async"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
// Why: landing page with quick CTA (download CV / contact) and primary links.
import {useCvData} from '@/composables/useCvData'
import {usePageLoader} from '@/composables/usePageLoader'

const cvData = useCvData()
const HOME_TITLE = cvData.personal.name
const HOME_SUBTITLE = cvData.personal.homeSubtitle
const HOME_META = cvData.personal.homeMeta ?? ''
const SOCIAL_LINKS = cvData.personal.contacts

usePageLoader('page')
</script>

<style scoped lang="scss">
@use "homePage.styles";
</style>
