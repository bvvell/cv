<template>
  <div
    id="page"
    class="not-found"
  >
    <div class="wrapp">
      <div class="content">
        <p class="eyebrow">
          404
        </p>
        <h1>Page not found</h1>
        <p class="intro">
          This page does not exist. Try the home page
        </p>
        <div class="actions">
          <router-link to="/">
            Home
          </router-link>
        </div>
      </div>
      <div class="ghost">
        ?
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Why: friendly catch-all page for unknown routes (both in SPA and SSG output).
import {usePageLoader} from '@/composables/usePageLoader'

usePageLoader('page', 100)
</script>

<style scoped lang="scss">
@use 'notFoundPage.styles';
</style>
