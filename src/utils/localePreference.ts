/**
 * The visitor's chosen language, remembered across pages and visits.
 *
 * Why it lives here and not in a module: the language switcher exists on the home
 * page, on the notes index and on every post, and all three mean the same thing by
 * it — "show me the site in this language". Whichever one the reader uses, the home
 * page comes up in that language next time.
 *
 * Why it is only a preference and never a redirect: `/posts/kamni-200/` is the
 * Belarusian URL, paired with the Russian one through `hreflang` and indexed as such.
 * Serving it in another language would break that pairing and would betray anyone who
 * shared the link. The stored choice decides what the home page opens in; the URL
 * always decides what a post page shows.
 */
export type SiteLocale = 'en' | 'be' | 'ru'

const STORAGE_KEY = 'bvvell:home-lang'

const isSiteLocale = (value: unknown): value is SiteLocale =>
    value === 'en' || value === 'be' || value === 'ru'

export const readStoredLocale = (): SiteLocale | null => {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        return isSiteLocale(stored) ? stored : null
    } catch {
        // Private mode or blocked storage: fall back to detection.
        return null
    }
}

export const storeLocale = (locale: SiteLocale) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, locale)
    } catch {
        // Nothing to do: the choice simply will not survive a reload.
    }
}
