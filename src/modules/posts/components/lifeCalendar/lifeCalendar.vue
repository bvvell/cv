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
      <div
        v-if="isValidDate && !hasFutureDate"
        class="life-calendar__stats"
      >
        <span>Пражыта: {{ livedWeeks }} тыдняў</span>
        <span>Наперадзе: {{ remainingWeeks }} тыдняў</span>
      </div>
    </div>

    <div
      v-if="isValidDate && !hasFutureDate"
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
              v-for="weekIndex in WEEKS_IN_YEAR"
              :key="`${yearIndex}-${weekIndex}`"
              class="life-calendar__cell"
              :class="`is-${cellClass(yearIndex - 1, weekIndex - 1)}`"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Why: interactive "life in weeks" calendar; helps visualize time and drive reflection.
// Why the grid is not prerendered: 52 weeks × N years is thousands of DOM nodes
// (the prerendered post used to weigh ~300 KB of HTML). The default is an empty
// birth date, so nothing renders until the reader enters their own — which is also
// the correct behaviour for a "enter YOUR date" tool.
import {computed, ref} from 'vue'
import {
    WEEKS_IN_YEAR,
    clampYears,
    parseBirthDate,
    weekOffsetInYear,
    weeksSinceBirth,
    weekState
} from './lifeCalendar.logic'

const birthDate = ref('')
const totalYearsInput = ref(80)

const maxDate = computed(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
})

const birth = computed(() => parseBirthDate(birthDate.value))
const isValidDate = computed(() => birth.value !== null)
const hasFutureDate = computed(() => isValidDate.value && (birth.value as Date).getTime() > Date.now())
const birthYear = computed(() => birth.value?.getFullYear() ?? 0)
const today = computed(() => new Date())
const currentYear = computed(() => today.value.getFullYear())

const weeksSince = computed(() => {
    if (!isValidDate.value || hasFutureDate.value) return 0
    return weeksSinceBirth(birth.value as Date, today.value)
})

const totalYears = computed(() => clampYears(totalYearsInput.value))

const livedWeeks = computed(() => Math.min(weeksSince.value, totalYears.value * WEEKS_IN_YEAR))
const remainingWeeks = computed(() => Math.max(0, totalYears.value * WEEKS_IN_YEAR - livedWeeks.value))

const startOffset = computed(() => (birth.value ? weekOffsetInYear(birth.value) : 0))
const currentOffset = computed(() => weekOffsetInYear(today.value))

const cellClass = (yearIndex: number, weekIndex: number) => weekState({
    yearIndex,
    weekIndex,
    birthYear: birthYear.value,
    currentYear: currentYear.value,
    startOffset: startOffset.value,
    currentOffset: currentOffset.value
})
</script>

<style scoped lang="scss">
@use './lifeCalendar.styles';
</style>
