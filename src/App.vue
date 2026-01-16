<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import {provideCvData} from '@/composables/useCvData'

provideCvData()
</script>

<style scoped>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
