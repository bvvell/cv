<template>
  <section class="life-calendar">
    <div class="life-calendar__controls">
      <label class="life-calendar__label">
        Дата нараджэння
        <input
          v-model="birthDate"
          class="life-calendar__input"
          type="date"
          :max="maxDate"
          :class="{'is-invalid': hasFutureDate}"
        >
      </label>
      <label class="life-calendar__label">
        Колькасць гадоў
        <input
          v-model.number="totalYearsInput"
          class="life-calendar__input"
          type="number"
          min="0"
          max="200"
        >
      </label>
      <p
        v-if="hasFutureDate"
        class="life-calendar__error"
      >
        Дата нараджэння не можа быць у будучыні.
      </p>
      <div class="life-calendar__stats">
        <span>Пражыта: {{ livedWeeks }} тыдняў</span>
        <span>Наперадзе: {{ remainingWeeks }} тыдняў</span>
      </div>
    </div>

    <div
      v-if="!hasFutureDate"
      class="life-calendar__grid"
    >
      <div class="life-calendar__rows">
        <div
          v-for="yearIndex in totalYears"
          :key="yearIndex"
          class="life-calendar__row"
        >
          <div class="life-calendar__row-label">
            {{ birthYear + yearIndex - 1 }}
          </div>
          <div class="life-calendar__weeks">
            <span
              v-for="weekIndex in weeksInYear"
              :key="`${yearIndex}-${weekIndex}`"
              class="life-calendar__cell"
              :class="cellClass(yearIndex - 1, weekIndex - 1)"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'

const weeksInYear = 52
const birthDate = ref('1990-12-06')
const totalYearsInput = ref(80)

const maxDate = computed(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
})

const birth = computed(() => new Date(`${birthDate.value}T00:00:00`))
const hasFutureDate = computed(() => birth.value.getTime() > Date.now())
const birthYear = computed(() => birth.value.getFullYear())
const today = computed(() => new Date())
const currentYear = computed(() => today.value.getFullYear())

const weeksSinceBirth = computed(() => {
    if (hasFutureDate.value) {
        return 0
    }
    const diffMs = today.value.getTime() - birth.value.getTime()
    return Math.max(0, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)))
})

const totalYears = computed(() => {
    const value = Number.isFinite(totalYearsInput.value)
        ? totalYearsInput.value
        : 0
    return Math.min(200, Math.max(0, Math.round(value)))
})

const livedWeeks = computed(() => Math.min(weeksSinceBirth.value, totalYears.value * weeksInYear))
const remainingWeeks = computed(() => Math.max(0, totalYears.value * weeksInYear - livedWeeks.value))

const startOffset = computed(() => {
    const birthDateValue = birth.value
    const yearStart = new Date(birthDateValue.getFullYear(), 0, 1)
    const msInDay = 24 * 60 * 60 * 1000
    const dayOfYear = Math.floor((birthDateValue.getTime() - yearStart.getTime()) / msInDay)
    const yearStartDay = yearStart.getDay()
    const yearStartOffset = (yearStartDay + 6) % 7
    return Math.floor((dayOfYear + yearStartOffset) / 7)
})

const currentOffset = computed(() => {
    const date = today.value
    const yearStart = new Date(date.getFullYear(), 0, 1)
    const msInDay = 24 * 60 * 60 * 1000
    const dayOfYear = Math.floor((date.getTime() - yearStart.getTime()) / msInDay)
    const yearStartDay = yearStart.getDay()
    const yearStartOffset = (yearStartDay + 6) % 7
    return Math.floor((dayOfYear + yearStartOffset) / 7)
})

const cellClass = (yearIndex: number, weekIndex: number) => {
    const year = birthYear.value + yearIndex

    if (year === birthYear.value && weekIndex < startOffset.value) {
        return 'is-prebirth'
    }

    if (year < currentYear.value) {
        return 'is-lived'
    }

    if (year > currentYear.value) {
        return 'is-future'
    }

    if (weekIndex < currentOffset.value) {
        return 'is-lived'
    }

    if (weekIndex === currentOffset.value) {
        return 'is-current'
    }

    return 'is-future'
}
</script>

<style scoped lang="scss">
@use './lifeCalendar.styles';
</style>
