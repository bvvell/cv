import {describe, expect, it} from 'vitest'
import {ensureTrailingSlash} from '../url'

describe('ensureTrailingSlash', () => {
    it('keeps the root path as-is', () => {
        expect(ensureTrailingSlash('/')).toBe('/')
    })

    it('adds a trailing slash to a bare path', () => {
        expect(ensureTrailingSlash('/cv')).toBe('/cv/')
        expect(ensureTrailingSlash('/posts/ru')).toBe('/posts/ru/')
    })

    it('keeps an existing trailing slash', () => {
        expect(ensureTrailingSlash('/posts/')).toBe('/posts/')
    })

    it('preserves query and hash while normalizing the pathname', () => {
        expect(ensureTrailingSlash('/posts/ru?page=2#top')).toBe('/posts/ru/?page=2#top')
        expect(ensureTrailingSlash('/posts/ru#top')).toBe('/posts/ru/#top')
    })

    it('does not touch file-like paths', () => {
        expect(ensureTrailingSlash('/cv.pdf')).toBe('/cv.pdf')
        expect(ensureTrailingSlash('/sitemap.xml')).toBe('/sitemap.xml')
    })
})
