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
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  h2 {
    margin: 0;
  }

  p {
    max-width: 75ch;
    margin: 0;
  }
}
</style>
