// @vitest-environment jsdom
import {afterEach, describe, expect, it} from 'vitest'
import {readStoredLocale, storeLocale} from '../localePreference'

const STORAGE_KEY = 'bvvell:home-lang'

afterEach(() => {
    window.localStorage.clear()
})

describe('readStoredLocale', () => {
    it('returns null when nothing is stored', () => {
        expect(readStoredLocale()).toBeNull()
    })

    it('returns a valid stored locale', () => {
        window.localStorage.setItem(STORAGE_KEY, 'ru')
        expect(readStoredLocale()).toBe('ru')
    })

    it('ignores an invalid stored value', () => {
        window.localStorage.setItem(STORAGE_KEY, 'de')
        expect(readStoredLocale()).toBeNull()
    })
})

describe('storeLocale', () => {
    it('persists the choice so the next read returns it', () => {
        storeLocale('be')
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('be')
        expect(readStoredLocale()).toBe('be')
    })
})
