/**
 * Pure life-in-weeks math, extracted from the component so it can be unit-tested
 * and stays independent of Vue reactivity.
 *
 * Why:
 * - The calendar draws a grid of 52 weeks × N years; the only things that matter are
 *   the week state of each cell and the two headline numbers (lived / remaining).
 * - Keeping this here (and not in the SFC) means the tricky date arithmetic is covered
 *   by tests without mounting the component.
 */
export const WEEKS_IN_YEAR = 52

export type WeekState = 'prebirth' | 'lived' | 'current' | 'future'

const MS_IN_DAY = 24 * 60 * 60 * 1000
const MS_IN_WEEK = 7 * MS_IN_DAY

/** Clamps the "total years" input to a sane range and rounds it. */
export const clampYears = (value: number, max = 200): number => {
    const years = Number.isFinite(value) ? value : 0
    return Math.min(max, Math.max(0, Math.round(years)))
}

/** Parses an `<input type="date">` value as a local-midnight Date, or `null`. */
export const parseBirthDate = (value: string): Date | null => {
    if (!value) return null
    const date = new Date(`${value}T00:00:00`)
    return Number.isNaN(date.getTime()) ? null : date
}

/** Monday-based week offset within a year (0 = the week that contains Jan 1). */
export const weekOffsetInYear = (date: Date): number => {
    const yearStart = new Date(date.getFullYear(), 0, 1)
    const dayOfYear = Math.floor((date.getTime() - yearStart.getTime()) / MS_IN_DAY)
    const yearStartOffset = (yearStart.getDay() + 6) % 7
    return Math.floor((dayOfYear + yearStartOffset) / 7)
}

/** Whole weeks elapsed between two dates (never negative). */
export const weeksSinceBirth = (birth: Date, now: Date): number => {
    return Math.max(0, Math.floor((now.getTime() - birth.getTime()) / MS_IN_WEEK))
}

/** The visual state of a single week cell. */
export const weekState = (args: {
    yearIndex: number
    weekIndex: number
    birthYear: number
    currentYear: number
    startOffset: number
    currentOffset: number
}): WeekState => {
    const {yearIndex, weekIndex, birthYear, currentYear, startOffset, currentOffset} = args
    const year = birthYear + yearIndex

    if (year === birthYear && weekIndex < startOffset) return 'prebirth'
    if (year < currentYear) return 'lived'
    if (year > currentYear) return 'future'
    if (weekIndex < currentOffset) return 'lived'
    if (weekIndex === currentOffset) return 'current'
    return 'future'
}
