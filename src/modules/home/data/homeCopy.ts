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
 * - The meta line is not a translation of the English one: English answers a recruiter
 *   ("which region, which timezone") and stays at "Based in Europe", while be/ru answers
 *   a reader who came from Threads and names the city. Minsk is in Europe, so neither
 *   version contradicts the other — they are the same fact at a different zoom.
 * - The role line and the tagline are not translated at all: a job title and a stack
 *   are what a reader scans for first, and in this trade they are read in English in
 *   every language. Translating them only makes the same thing harder to recognise.
 */
import {POST_LOCALES, type PostLocale} from '@/modules/posts/data/locale'
import type {SiteLocale} from '@/utils/localePreference'

export const HOME_LOCALES: SiteLocale[] = ['en', ...POST_LOCALES]

export type HomeCopy = {
    // Self-name of the language, used in the switcher.
    langName: string
    meta: string
    downloadCv: string
    switchLabel: string
}

export const homeCopy: Record<PostLocale, HomeCopy> = {
    be: {
        langName: 'Беларуская',
        meta: '9+ гадоў · Аддалена · Жыву ў Менску · Заўсёды рады пагаварыць',
        downloadCv: 'Спампаваць рэзюмэ',
        switchLabel: 'Мова'
    },
    ru: {
        langName: 'Русский',
        meta: '9+ лет · Удалённо · Живу в Минске · Всегда рад поговорить',
        downloadCv: 'Скачать резюме',
        switchLabel: 'Язык'
    }
}

export const EN_LANG_NAME = 'English'

// Shown under the role line in every language — see the note at the top of the file.
export const HOME_VALUE = 'Vue/TypeScript · UI engineering · performance-first.'


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
 * and `storeLocale` makes one click permanent — from any page of the site.
 */
export const detectHomeLocale = (languages: readonly string[] | undefined): SiteLocale => {
    for (const entry of languages ?? []) {
        const normalized = entry.toLowerCase()
        if (normalized.startsWith('be') || normalized.startsWith('ru')) return 'be'
        if (normalized.startsWith('en')) return 'en'
    }
    return 'en'
}
