<template>
  <div class="cv-skills">
    <div class="columns">
      <div class="col">
        <h2>{{ skills.title }}</h2>
        <ul>
          <li
            v-for="(skill, idx) in skills.items"
            :key="idx"
          >
            {{ skill }}
          </li>
        </ul>
      </div>

      <div class="col">
        <h2>{{ technologies.title }}</h2>
        <ul>
          <li
            v-for="(tech, idx) in technologies.items"
            :key="idx"
          >
            {{ tech }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Why: quickly communicates strengths; driven by the JSON data to keep editing easy.
import type { SkillsSection } from './cvSkills.types'

defineProps<{
  skills: SkillsSection
  technologies: SkillsSection
}>()
</script>

<style scoped lang="scss">
@use './cvSkills.styles.scss';
</style>
