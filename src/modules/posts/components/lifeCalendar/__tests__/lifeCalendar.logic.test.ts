import {describe, expect, it} from 'vitest'
import {
    WEEKS_IN_YEAR,
    clampYears,
    parseBirthDate,
    weekOffsetInYear,
    weeksSinceBirth,
    weekState
} from '../lifeCalendar.logic'

describe('parseBirthDate', () => {
    it('parses an input[type=date] value into a Date', () => {
        expect(parseBirthDate('1990-12-06')?.getFullYear()).toBe(1990)
    })

    it('returns null for empty or invalid input', () => {
        expect(parseBirthDate('')).toBeNull()
        expect(parseBirthDate('not-a-date')).toBeNull()
    })
})

describe('clampYears', () => {
    it('rounds and clamps to a sane range', () => {
        expect(clampYears(80)).toBe(80)
        expect(clampYears(80.4)).toBe(80)
        expect(clampYears(80.6)).toBe(81)
        expect(clampYears(-5)).toBe(0)
        expect(clampYears(999)).toBe(200)
        expect(clampYears(Number.NaN)).toBe(0)
    })
})

describe('weekOffsetInYear', () => {
    it('computes a Monday-based week offset', () => {
        // 1990-01-01 was a Monday, so its week offset is 0.
        expect(weekOffsetInYear(new Date('1990-01-01T00:00:00'))).toBe(0)
    })
})

describe('weeksSinceBirth', () => {
    it('counts whole weeks elapsed', () => {
        const birth = new Date('2000-01-01T00:00:00')
        expect(weeksSinceBirth(birth, new Date('2000-01-15T00:00:00'))).toBe(2)
    })

    it('never returns a negative count', () => {
        const later = new Date('2001-01-01T00:00:00')
        const earlier = new Date('2000-01-01T00:00:00')
        expect(weeksSinceBirth(later, earlier)).toBe(0)
    })
})

describe('weekState', () => {
    const base = {birthYear: 2000, currentYear: 2000, startOffset: 0, currentOffset: 2}

    it('marks weeks before the current one as lived', () => {
        expect(weekState({...base, yearIndex: 0, weekIndex: 0})).toBe('lived')
        expect(weekState({...base, yearIndex: 0, weekIndex: 1})).toBe('lived')
    })

    it('marks the current week', () => {
        expect(weekState({...base, yearIndex: 0, weekIndex: 2})).toBe('current')
    })

    it('marks weeks after the current one as future', () => {
        expect(weekState({...base, yearIndex: 0, weekIndex: 3})).toBe('future')
    })

    it('marks whole past years as lived and future years as future', () => {
        expect(weekState({...base, currentYear: 2002, yearIndex: 0, weekIndex: 0})).toBe('lived')
        expect(weekState({...base, yearIndex: 1, weekIndex: 0})).toBe('future')
    })

    it('marks pre-birth weeks in the birth year', () => {
        expect(weekState({
            birthYear: 2000,
            currentYear: 2000,
            startOffset: 3,
            currentOffset: 3,
            yearIndex: 0,
            weekIndex: 0
        })).toBe('prebirth')
    })

    it('exports the fixed weeks-per-year constant', () => {
        expect(WEEKS_IN_YEAR).toBe(52)
    })
})
