<template>
  <div class="cv-header">
    <h1>{{ personal.name }}</h1>
    <div class="contacts">
      <span>{{ personal.location }}</span>
      <span><a :href="`mailto:${personal.contacts.email}`">{{ personal.contacts.email }}</a></span>
      <span>
        <a
          :href="personal.contacts.linkedin"
          target="_blank"
          rel="me noopener noreferrer"
        >LinkedIn</a>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
// Why: top CV block — name and quick contact info.
import type {Personal} from './cvHeader.types'

defineProps<{
  personal: Personal
}>()
</script>

<style scoped lang="scss">
@use './cvHeader.styles.scss';
</style>
