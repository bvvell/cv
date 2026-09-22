/**
 * Home page copy for the languages the site actually speaks.
 *
 * Why:
 * - The page is prerendered in English: that is the version Google indexes and the
 *   one recruiters arrive at from LinkedIn, and the CV behind it is English too.
 * - Most live readers, though, come from Threads with a Belarusian- or Russian-set
 *   browser, and the notes they came for are written in those languages. So after
 *   mount the page can switch, and the visitor can override the guess.
 * - English strings are not duplicated here: they live in `src/data/cv.json`, the
 *   single source of truth for the CV itself.
 */
import {POST_LOCALES, type PostLocale} from '@/modules/posts/data/locale'

export type HomeLocale = 'en' | PostLocale

export const HOME_LOCALES: HomeLocale[] = ['en', ...POST_LOCALES]

export type HomeCopy = {
    // Self-name of the language, used in the switcher.
    langName: string
    role: string
    meta: string
    value: string
    downloadCv: string
    switchLabel: string
}

export const homeCopy: Record<PostLocale, HomeCopy> = {
    be: {
        langName: 'Беларуская',
        role: 'UI-інжынер / фронтэнд-распрацоўшчык',
        meta: '9+ гадоў · Аддалена · Жыву ў Еўропе · Адкрыты да аддаленых роляў',
        value: 'Vue/TypeScript · UI-інжынерыя · спачатку хуткасць.',
        downloadCv: 'Спампаваць рэзюмэ',
        switchLabel: 'Мова'
    },
    ru: {
        langName: 'Русский',
        role: 'UI-инженер / фронтенд-разработчик',
        meta: '9+ лет · Удалённо · Живу в Европе · Открыт к удалённым ролям',
        value: 'Vue/TypeScript · UI-инженерия · сначала скорость.',
        downloadCv: 'Скачать резюме',
        switchLabel: 'Язык'
    }
}

export const EN_LANG_NAME = 'English'

// Why: the guess is only a guess — a visitor who switches should stay switched.
const STORAGE_KEY = 'bvvell:home-lang'

const isHomeLocale = (value: unknown): value is HomeLocale =>
    value === 'en' || value === 'be' || value === 'ru'

export const readStoredHomeLocale = (): HomeLocale | null => {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        return isHomeLocale(stored) ? stored : null
    } catch {
        // Private mode or blocked storage: fall back to detection.
        return null
    }
}

export const storeHomeLocale = (locale: HomeLocale) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, locale)
    } catch {
        // Nothing to do: the choice simply will not survive a reload.
    }
}

/**
 * Guesses the language from the visitor's browser preferences.
 *
 * Why English for everything except `be`/`ru`: a German or Polish recruiter is far
 * better served by English than by a language they cannot read, while `be`/`ru`
 * browsers are exactly the audience the notes are written for.
 *
 * Why a Russian browser gets Belarusian: it is the site's own voice, and the traffic
 * so far reads the Belarusian posts far more than their Russian translations. Russian
 * stays one click away.
 *
 * Why the whole `navigator.languages` list and not just the first entry: the list is
 * ordered by the visitor's own preference, so a browser set to `uk, ru` should get
 * Belarusian while one set to `en, ru` should stay English. The first entry we
 * recognise wins; an unrecognised list falls back to English.
 *
 * This is a guess either way — a Minsk reader on an English-language macOS looks
 * exactly like a recruiter in Berlin. The switcher above the name is the real answer,
 * and `storeHomeLocale` makes one click permanent.
 */
export const detectHomeLocale = (languages: readonly string[] | undefined): HomeLocale => {
    for (const entry of languages ?? []) {
        const normalized = entry.toLowerCase()
        if (normalized.startsWith('be') || normalized.startsWith('ru')) return 'be'
        if (normalized.startsWith('en')) return 'en'
    }
    return 'en'
}
