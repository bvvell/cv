<template>
  <main id="main">
    <router-view />
  </main>
</template>

<script setup lang="ts">
import {provideCvData} from '@/composables/useCvData'
import {useOutboundTracking} from '@/composables/useOutboundTracking'
import {useSiteHead} from '@/composables/useSiteHead'

// Why: make CV JSON available via `useCvData()` for all pages/components.
provideCvData()

// Why: SEO/meta is route-driven, so we configure it once at the root.
useSiteHead()

// Why: downloads and outbound clicks happen everywhere, so they are tracked once here.
useOutboundTracking()
</script>
