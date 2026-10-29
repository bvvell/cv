<template>
  <div class="cv-summary">
    <h2>Summary</h2>
    <p>{{ summary }}</p>
  </div>
</template>

<script setup lang="ts">
// Why: short “elevator pitch” section at the top of the CV.
defineProps<{
  summary: string
}>()
</script>

<style scoped lang="scss">
.cv-summary {
  p {
    max-width: 75ch;
    margin: 0;
  }
}
</style>
