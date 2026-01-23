<template>
  <div id="app">
    <main id="main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import {provideCvData} from '@/composables/useCvData'
import {useSiteHead} from '@/composables/useSiteHead'

// Why: make CV JSON available via `useCvData()` for all pages/components.
provideCvData()

// Why: SEO/meta is route-driven, so we configure it once at the root.
useSiteHead()
</script>
