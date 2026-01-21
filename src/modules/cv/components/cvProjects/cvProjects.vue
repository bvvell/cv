<template>
  <div class="cv-projects">
    <div class="col">
      <h2>{{ projects.title }}</h2>
      <dl>
        <template
          v-for="project in projects.items"
          :key="project.name"
        >
          <dt>
            <b v-if="!project.url">{{ project.name }}</b>
            <b v-else>
              <a
                :href="project.url"
                target="_blank"
                rel="nofollow noopener noreferrer"
              >{{ project.name }}</a>
            </b>
          </dt>
          <dd class="muted">
            {{ project.summary }}
          </dd>
          <dd>
            <ul>
              <li
                v-for="(line, idx) in project.contribution"
                :key="idx"
              >
                {{ line }}
              </li>
            </ul>
            <p
              v-if="project.impact"
              class="stack"
            >
              <span class="muted">Impact:</span> {{ project.impact }}
            </p>
            <p
              v-if="project.stack"
              class="stack"
            >
              <span class="muted">Stack:</span> {{ project.stack }}
            </p>
          </dd>
        </template>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
// Why: highlight a few “real” things shipped, with contribution + impact.
import type {ProjectsSection} from './cvProjects.types'

defineProps<{
  projects: ProjectsSection
}>()
</script>

<style scoped lang="scss">
@use './cvProjects.styles.scss';
</style>
