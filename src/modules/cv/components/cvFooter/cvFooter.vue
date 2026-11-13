<template>
  <div class="cv-footer">
    <p class="contact">
      <a
        :href="`mailto:${contacts.email}`"
        aria-label="Email"
        target="_blank"
        rel="noopener noreferrer"
      >Email</a>
      &nbsp;•&nbsp;
      <a
        :href="contacts.linkedin"
        target="_blank"
        aria-label="LinkedIn"
        rel="me noopener noreferrer"
      >
        LinkedIn
      </a>
      &nbsp;•&nbsp;
      <template v-if="contacts.github">
        <a
          :href="contacts.github"
          target="_blank"
          aria-label="GitHub"
          rel="me noopener noreferrer"
        >GitHub</a>
        &nbsp;•&nbsp;
      </template>
      <a
        :href="`${contacts.telegram}`"
        aria-label="Telegram"
        target="_blank"
        rel="me noopener noreferrer"
      >Telegram</a>
    </p>
  </div>
</template>

<script setup lang="ts">
// Why: repeated contact links at the end of the CV.
defineProps<{
  contacts: {
    email: string
    linkedin: string
    github?: string
    telegram: string
  }
}>()
</script>

<style scoped lang="scss">
@use './cvFooter.styles.scss';
</style>
