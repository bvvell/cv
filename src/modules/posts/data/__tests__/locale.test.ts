import {describe, expect, it} from 'vitest'
import {
    formatPostDate,
    htmlLang,
    isPostLocale,
    ogLocale,
    otherLocale,
    postPath
} from '../locale'

describe('formatPostDate', () => {
    it('formats a Belarusian date', () => {
        expect(formatPostDate('be', '2026-09-21')).toBe('21 верасня 2026')
    })

    it('formats a Russian date', () => {
        expect(formatPostDate('ru', '2026-09-21')).toBe('21 сентября 2026')
    })

    it('formats the first day of a month without a leading zero', () => {
        expect(formatPostDate('be', '2026-01-01')).toBe('1 студзеня 2026')
    })

    it('returns the raw value for an invalid date', () => {
        expect(formatPostDate('be', 'not-a-date')).toBe('not-a-date')
    })
})

describe('postPath', () => {
    it('maps Belarusian posts to /posts/slug/', () => {
        expect(postPath('be', 'kamni-200')).toBe('/posts/kamni-200/')
    })

    it('maps Russian posts to /posts/ru/slug/', () => {
        expect(postPath('ru', 'kamni-200')).toBe('/posts/ru/kamni-200/')
    })
})

describe('isPostLocale', () => {
    it('accepts the two post locales', () => {
        expect(isPostLocale('be')).toBe(true)
        expect(isPostLocale('ru')).toBe(true)
    })

    it('rejects anything else', () => {
        expect(isPostLocale('en')).toBe(false)
        expect(isPostLocale(undefined)).toBe(false)
    })
})

describe('locale maps', () => {
    it('exposes html lang, og locale and the sibling locale per language', () => {
        expect(htmlLang.be).toBe('be')
        expect(htmlLang.ru).toBe('ru')
        expect(ogLocale.be).toBe('be_BY')
        expect(ogLocale.ru).toBe('ru_RU')
        expect(otherLocale.be).toBe('ru')
        expect(otherLocale.ru).toBe('be')
    })
})
