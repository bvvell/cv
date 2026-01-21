<template>
  <div class="cv-experience">
    <div class="col">
      <h2>Experience</h2>
      <dl>
        <template
          v-for="exp in experience"
          :key="exp.company"
        >
          <dt><b>{{ exp.company }}</b> — {{ exp.position }}</dt>
          <dd class="muted">
            {{ exp.period }}
          </dd>
          <dd>
            <ul>
              <li
                v-for="(desc, idx) in exp.description"
                :key="idx"
              >
                {{ desc }}
              </li>
            </ul>
            <div
              v-if="exp.tags"
              class="tags"
            >
              <span
                v-for="tag in exp.tags"
                :key="tag"
                class="tag"
              >{{ tag }}</span>
            </div>
          </dd>
        </template>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
// Why: present experience as scannable bullet points with optional tech tags.
import type {Experience} from './cvExperience.types'

defineProps<{
  experience: readonly Experience[]
}>()
</script>

<style scoped lang="scss">
@use './cvExperience.styles.scss';
</style>
