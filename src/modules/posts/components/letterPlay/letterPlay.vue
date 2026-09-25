<template>
  <section
    class="letter-play"
    :aria-label="copy.title"
  >
    <form
      class="letter-play__controls"
      @submit.prevent="generate"
    >
      <label for="letter-play-text">{{ copy.label }}</label>
      <textarea
        id="letter-play-text"
        v-model="input"
        rows="4"
        :maxlength="MAX_CHARACTERS"
        required
        :placeholder="copy.example"
        aria-describedby="letter-play-help"
      />
      <p
        id="letter-play-help"
        class="letter-play__help"
      >
        {{ copy.help }}
      </p>
      <label for="letter-play-line">{{ copy.line }}</label>
      <select
        id="letter-play-line"
        v-model="line"
      >
        <option value="wave">
          {{ copy.wave }}
        </option>
        <option value="winding">
          {{ copy.winding }}
        </option>
        <option value="straight">
          {{ copy.straight }}
        </option>
      </select>
      <div class="letter-play__actions">
        <button
          type="submit"
          :disabled="!input.trim()"
        >
          {{ rows.length ? copy.again : copy.generate }}
        </button>
        <button
          v-if="rows.length"
          type="button"
          class="letter-play__print"
          @click="print"
        >
          {{ copy.print }}
        </button>
      </div>
      <p
        class="letter-play__help"
        role="status"
      >
        {{ rows.length ? copy.ready : copy.empty }}
      </p>
    </form>
    <div
      v-if="rows.length"
      class="letter-play__sheet"
      :aria-label="copy.sheet"
    >
      <p class="letter-play__instruction">
        {{ copy.instruction }}
      </p>
      <svg
        v-for="(row, index) in rows"
        :key="index"
        class="letter-play__row"
        :viewBox="`0 0 720 ${generatedLine === 'winding' ? 230 : 150}`"
        role="img"
        :aria-label="row.map(letter => letter.text).join('')"
      >
        <path
          :d="paths[index]"
          fill="none"
          stroke="#bcbcbc"
          stroke-opacity="0.4"
          stroke-width="1"
        />
        <text
          v-for="(letter, letterIndex) in row"
          :key="letterIndex"
          :transform="`translate(${letter.x} ${letter.y}) rotate(${letter.angle})`"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="Arial, sans-serif"
          font-size="32"
          font-weight="700"
          fill="#111"
        >{{ letter.text }}</text>
      </svg>
    </div>
  </section>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import type {PostLocale} from '@/modules/posts/data/locale'

const props = withDefaults(defineProps<{locale?: PostLocale}>(), {locale: 'be'})
const MAX_CHARACTERS = 1000
const translations = {
  ru: {
    title: 'Буквы на прогулке', label: 'Короткое предложение', example: 'Мама мыла раму.',
    help: `До ${MAX_CHARACTERS} символов. Пробелы и порядок букв сохраняются. Длинный текст переносится на следующие строки, а при печати — на несколько страниц.`,
    line: 'Линия', wave: 'Волнистая', winding: 'Извилистая', straight: 'Прямая', generate: 'Разложить буквы', again: 'Разложить заново',
    print: 'Распечатать', empty: 'Введите предложение и нажмите «Разложить буквы».',
    ready: 'Лист готов. Можно получить другой вариант или распечатать этот. Изменения текста и линии применяются при повторной генерации.',
    sheet: 'Лист для печати', instruction: 'Прочитай предложение. Двигайся по линии слева направо.'
  },
  be: {
    title: 'Літары на прагулцы', label: 'Кароткі сказ', example: 'Мама мыла раму.',
    help: `Да ${MAX_CHARACTERS} сімвалаў. Прабелы і парадак літар захоўваюцца. Доўгі тэкст пераносіцца на наступныя радкі, а пры друку — на некалькі старонак.`,
    line: 'Лінія', wave: 'Хвалістая', winding: 'Звілістая', straight: 'Прамая', generate: 'Раскласці літары', again: 'Раскласці нанова',
    print: 'Раздрукаваць', empty: 'Увядзіце сказ і націсніце «Раскласці літары».',
    ready: 'Аркуш гатовы. Можна атрымаць іншы варыянт або раздрукаваць гэты. Змены тэксту і лініі прымяняюцца пры паўторнай генерацыі.',
    sheet: 'Аркуш для друку', instruction: 'Прачытай сказ. Рухайся па лініі злева направа.'
  }
}
const copy = computed(() => translations[props.locale])
const input = ref(props.locale === 'be'
  ? 'Мой родны кут, як ты мне мілы!'
  : 'Послушайте! Ведь, если звёзды зажигают — значит — это кому-нибудь нужно?')
type Line = 'wave' | 'straight' | 'winding'
const line = ref<Line>('winding')
const generatedLine = ref<Line>('winding')
type Letter = {text: string; x: number; y: number; angle: number}
const rows = ref<Letter[][]>([])
const paths = ref<string[]>([])
const lineY = (kind: Line, x: number, phase: number) => {
  const t = (x - 20) / 680 * Math.PI * 2
  if (kind === 'straight') return 75
  if (kind === 'wave') return 75 + Math.sin(t) * 25
  // Several unequal bends; horizontal spacing keeps rotated letters apart.
  return 115 + Math.sin(t * 2.6 + phase) * 58 + Math.sin(t * 5 - phase) * 18
}

const generate = () => {
  const text = input.value.trim().replace(/\s/gu, ' ')
  if (!text) return
  // Segment graphemes so combining accents stay attached to their letters.
  const letters = Array.from(new Intl.Segmenter(props.locale, {granularity: 'grapheme'}).segment(text), item => item.segment).slice(0, MAX_CHARACTERS)
  generatedLine.value = line.value
  const next: Letter[][] = []
  const nextPaths: string[] = []
  for (let start = 0; start < letters.length; start += 12) {
    const phase = Math.random() * Math.PI * 2
    nextPaths.push(line.value === 'straight' ? 'M 20 75 H 700' : Array.from({length: 341}, (_, i) => {
      const x = 20 + i * 2
      return `${i ? 'L' : 'M'} ${x} ${lineY(line.value, x, phase)}`
    }).join(' '))
    next.push(letters.slice(start, start + 12).map((letter, index) => {
      const x = 45 + index * 57
      return {text: letter, x, y: lineY(line.value, x, phase), angle: Math.floor(Math.random() * 360)}
    }))
  }
  paths.value = nextPaths
  rows.value = next
}
const print = () => window.print()
</script>

<style scoped lang="scss">
.letter-play {
  margin: 2rem 0;
  font-family: var(--font-sans);

  &__controls {
    display: grid;
    gap: .75rem;
    padding: 1.5rem;
    border: 1px solid var(--hairline);
    border-radius: 12px;
    background: var(--paper);
  }

  label { font-weight: 600; }

  textarea, select, button {
    box-sizing: border-box;
    max-width: 100%;
    font: inherit;
    border: 1px solid var(--muted);
    border-radius: 6px;
    padding: .75rem 1rem;
  }

  textarea, select { color: var(--ink); background: var(--paper); }
  textarea { width: 100%; resize: vertical; }
  select { justify-self: start; }
  button { cursor: pointer; background: var(--ink); color: var(--paper); }
  button:disabled { opacity: .5; cursor: default; }
  &__print { background: transparent !important; color: var(--ink) !important; }
  :is(textarea, select, button):focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  &__actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: .5rem; }
  & .letter-play__help { margin: 0; font-size: .875rem; color: var(--ink-2); }
  &__sheet { margin-top: 1.5rem; padding: 1rem; background: white; color: #111; border: 1px solid #ddd; }
  & .letter-play__instruction { color: #111; font-size: 14px; font-family: Arial, sans-serif; }
  &__row { display: block; width: 100%; height: auto; break-inside: avoid; }
}
</style>

<style lang="scss">
@media print {
  html:has(.letter-play__sheet) { background: white !important; }
  // Keep only the worksheet and its ancestors in the print layout.
  body:has(.letter-play__sheet) {
    background: white !important;
    *:not(:has(.letter-play__sheet)):not(.letter-play__sheet):not(.letter-play__sheet *) { display: none !important; }
    *:has(.letter-play__sheet) {
      display: block !important;
      margin: 0 !important;
      padding: 0 !important;
      max-width: none !important;
      width: auto !important;
      min-height: 0 !important;
      transform: none !important;
      background: white !important;
      box-shadow: none !important;
    }
    .letter-play__sheet { margin: 0; padding: 0; border: 0; }
    .letter-play__row { break-inside: avoid; }
  }
}
</style>
