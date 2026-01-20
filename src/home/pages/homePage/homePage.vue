<template>
  <div
    id="page"
    class="home-data"
  >
    <div class="wrapp">
      <div class="hero">
        <div class="hero__content">
          <p class="hero__eyebrow">
            Frontend Developer
          </p>
          <h1 class="hero__title">
            {{ HOME_TITLE }}
          </h1>
          <p class="hero__subtitle">
            {{ HOME_SUBTITLE }}
          </p>
          <p class="hero__value">
            Vue/TypeScript • UI engineering • performance-first.
          </p>

          <div class="hero__actions">
            <router-link
              class="btn btn--primary"
              to="/cv"
            >
              View CV
            </router-link>
            <a
              class="btn btn--secondary"
              href="/cv.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download PDF
            </a>
            <a
              class="btn btn--ghost"
              :href="`mailto:${SOCIAL_LINKS.email}?subject=Hi%20Uladzimir`"
            >
              Contact
            </a>
          </div>

          <div class="hero__socials">
            <a
              class="icon-btn"
              :href="SOCIAL_LINKS.telegram"
              target="_blank"
              rel="me noopener noreferrer"
              aria-label="Telegram"
              title="Telegram"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M9.04 15.56 8.86 18.2c.39 0 .56-.17.77-.37l1.85-1.77 3.84 2.81c.71.39 1.21.18 1.39-.65l2.51-11.77v0c.21-.98-.36-1.36-.99-1.13L2.32 9.68c-.95.37-.93.9-.16 1.14l4.58 1.43 10.63-6.7c.5-.31.95-.14.58.17z"
                />
              </svg>
            </a>
            <a
              class="icon-btn"
              :href="SOCIAL_LINKS.linkedin"
              target="_blank"
              rel="me noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M6.94 6.5A2.06 2.06 0 1 1 4.88 4.44 2.06 2.06 0 0 1 6.94 6.5ZM7 8.2H4.8V19.6H7Zm3.5 0H8.33V19.6h2.17v-6c0-1.6.3-3.2 2.29-3.2s2 1.86 2 3.3v5.9h2.17v-6.3c0-3.1-.66-5.48-4.27-5.48a3.73 3.73 0 0 0-3.19 1.75h0Z"
                />
              </svg>
            </a>
            <a
              v-if="SOCIAL_LINKS.instagram"
              class="icon-btn"
              :href="SOCIAL_LINKS.instagram"
              target="_blank"
              rel="me noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 4.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2Zm0 2A1.8 1.8 0 1 0 13.8 12 1.8 1.8 0 0 0 12 10.2ZM17.6 6.4a.9.9 0 1 1-.9.9.9.9 0 0 1 .9-.9Z"
                />
              </svg>
            </a>
            <a
              v-if="SOCIAL_LINKS.threads"
              class="icon-btn"
              :href="SOCIAL_LINKS.threads"
              target="_blank"
              rel="me noopener noreferrer"
              aria-label="Threads"
              title="Threads"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M12 2c-4.97 0-9 4.03-9 9 0 3.97 2.57 7.34 6.14 8.53.09-.7.17-1.77.03-2.53-.13-.69-.86-4.41-.86-4.41s-.22-.58-.22-1.43c0-1.34.78-2.34 1.75-2.34.82 0 1.22.62 1.22 1.36 0 .83-.53 2.07-.8 3.22-.23.96.49 1.74 1.44 1.74 1.73 0 3.06-1.83 3.06-4.47 0-2.34-1.68-3.98-4.08-3.98-2.78 0-4.41 2.09-4.41 4.24 0 .84.32 1.74.72 2.23.08.1.09.19.07.29-.08.32-.24 1.01-.28 1.15-.05.19-.16.23-.37.14-1.38-.64-2.24-2.66-2.24-4.28 0-3.48 2.53-6.68 7.3-6.68 3.83 0 6.8 2.73 6.8 6.37 0 3.8-2.4 6.86-5.73 6.86-1.12 0-2.17-.58-2.53-1.27l-.69 2.62c-.25.97-.93 2.18-1.38 2.92C10.2 21.82 11.07 22 12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9Z"
                />
              </svg>
            </a>

            <router-link
              class="icon-btn"
              to="/posts"
              aria-label="Posts"
              title="Posts"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M6 4h12v2H6V4Zm0 5h12v2H6V9Zm0 5h12v2H6v-2Zm0 5h8v2H6v-2Z"
                />
              </svg>
            </router-link>
          </div>
        </div>

        <div class="hero__media">
          <div class="hero__avatar">
            <img
              src="/av.png"
              alt="Uladzimir Biarnatski"
              loading="lazy"
              decoding="async"
            >
          </div>
        </div>
      </div>
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
