<template>
  <div
    id="page"
    class="home-data"
  >
    <div class="wrapp">
      <div class="content">
        <h1>{{ HOME_TITLE }}</h1>
        <h2>
          <router-link to="/cv">
            {{ HOME_SUBTITLE }}
          </router-link>
        </h2>
        <div class="contact">
          <a
            :href="SOCIAL_LINKS.telegram"
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram
          </a>
          <a
            :href="SOCIAL_LINKS.linkedin"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
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
        loading="lazy"
        decoding="async"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import {useCvData} from '@/composables/useCvData'
import {usePageLoader} from '@/composables/usePageLoader'

const cvData = useCvData()
const HOME_TITLE = cvData.personal.name
const HOME_SUBTITLE = cvData.personal.homeSubtitle
const SOCIAL_LINKS = cvData.personal.contacts

usePageLoader('page', 100)
</script>

<style scoped lang="scss">
@use "homePage.styles";
</style>
