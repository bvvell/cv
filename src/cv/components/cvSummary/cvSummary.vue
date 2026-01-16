<template>
  <div class="cv-summary">
    <h2>Summary</h2>
    <p>{{ summary }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  summary: string
}>()
</script>

<style scoped lang="scss">
.cv-summary {
  p {
    max-width: 75ch;
  }
}
</style>

