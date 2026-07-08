<template>
  <div
    ref="pageRef"
    class="cv-page"
  >
    <PageShell>
      <router-link
        class="cv-back"
        :to="{name: RouteName.Home}"
      >
        <svg
          class="cv-back__icon"
          viewBox="0 0 1024 1024"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="currentColor"
            d="M609.408 149.376 277.76 489.6a32 32 0 0 0 0 44.672l331.648 340.352a29.12 29.12 0 0 0 41.728 0 30.59 30.59 0 0 0 0-42.752L339.264 511.936l311.872-319.872a30.59 30.59 0 0 0 0-42.688 29.12 29.12 0 0 0-41.728 0"
          />
        </svg>
        Back
      </router-link>
      <article class="cv-body">
        <cv-header :personal="cvData.personal" />
        <cv-summary :summary="cvData.summary" />
        <cv-skills
          :skills="cvData.skills"
          :technologies="cvData.technologies"
        />
        <cv-experience :experience="cvData.experience" />
        <cv-projects :projects="cvData.projects" />
        <cv-education
          :education="cvData.education"
          :courses="cvData.courses"
        />
        <cv-footer :contacts="cvData.personal.contacts" />
      </article>
    </PageShell>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {useCvData} from '@/composables/useCvData'
import {usePageLoader} from '@/composables/usePageLoader'
import {CvEducation, CvExperience, CvFooter, CvHeader, CvProjects, CvSkills, CvSummary} from '@/modules/cv/components'
import {RouteName} from '@/router/routeNames'
import PageShell from '@/components/PageShell.vue'

const cvData = useCvData()
const pageRef = ref<HTMLElement | null>(null)
usePageLoader(pageRef)
</script>

<style scoped lang="scss">
@use 'cvPage.styles';
</style>
