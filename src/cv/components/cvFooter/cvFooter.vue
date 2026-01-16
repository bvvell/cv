<template>
  <div class="cv-footer">
    <p class="contact">
      <a
        :href="contacts.linkedin"
        target="_blank"
        aria-label="LinkedIn"
        rel="noopener"
      >
        LinkedIn
      </a>
      &nbsp;•&nbsp;
      <a
        :href="`mailto:${contacts.email}`"
        aria-label="Email"
        target="_blank"
      >Email</a>
      &nbsp;•&nbsp;
      <a
        :href="`${contacts.telegram}`"
        aria-label="Telegram"
        target="_blank"
      >Telegram</a>
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  contacts: {
    email: string
    linkedin: string
    telegram: string
  }
}>()
</script>

<style scoped lang="scss">
@use './cvFooter.styles.scss';
</style>

