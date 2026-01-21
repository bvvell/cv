<template>
  <div class="cv-education">
    <div class="columns">
      <div class="col">
        <h2>Education</h2>
        <dl>
          <template
            v-for="edu in education"
            :key="edu.school"
          >
            <dt><b>{{ edu.school }}</b></dt>
            <dd>{{ edu.degree }}, {{ edu.period }}</dd>
          </template>
        </dl>
      </div>

      <div class="col">
        <h2>Courses</h2>
        <ul>
          <li
            v-for="(course, idx) in courses"
            :key="idx"
          >
            <a
              v-if="course.url"
              :href="course.url"
              target="_blank"
              rel="nofollow noopener noreferrer"
            >
              {{ course.title }}
            </a>
            <span v-else>{{ course.title }}</span>
            <span v-if="course.year"> — {{ course.year }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Why: show background/education in a compact, scannable format.
import type {Course, Education} from './cvEducation.types'

defineProps<{
  education: readonly Education[]
  courses: readonly Course[]
}>()
</script>

<style scoped lang="scss">
@use './cvEducation.styles.scss';
</style>
