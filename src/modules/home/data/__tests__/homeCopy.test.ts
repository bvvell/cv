import {describe, expect, it} from 'vitest'
import {detectHomeLocale} from '../homeCopy'

describe('detectHomeLocale', () => {
    it('maps Belarusian and Russian browsers to Belarusian', () => {
        expect(detectHomeLocale(['be-BY'])).toBe('be')
        expect(detectHomeLocale(['ru-RU', 'en-US'])).toBe('be')
    })

    it('keeps English when English comes first', () => {
        expect(detectHomeLocale(['en-US'])).toBe('en')
        expect(detectHomeLocale(['en-US', 'ru-RU'])).toBe('en')
    })

    it('falls back to English for unknown, empty or missing lists', () => {
        expect(detectHomeLocale(['de-DE'])).toBe('en')
        expect(detectHomeLocale([])).toBe('en')
        expect(detectHomeLocale(undefined)).toBe('en')
    })

    it('matches language tags case-insensitively', () => {
        expect(detectHomeLocale(['RU-ru'])).toBe('be')
        expect(detectHomeLocale(['EN-us'])).toBe('en')
    })
})
