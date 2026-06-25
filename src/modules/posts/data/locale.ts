/**
 * Posts localization: locale list, per-locale UI/SEO copy, and route mapping.
 *
 * Why:
 * - Belarusian posts live at `/posts/`, Russian at `/posts/ru/`.
 * - The site has no i18n library; for a handful of locales a small typed map is
 *   simpler and keeps all strings in one place.
 */
import {RouteName} from '@/router/routeNames'

export type PostLocale = 'be' | 'ru'

export const DEFAULT_LOCALE: PostLocale = 'be'
export const POST_LOCALES: PostLocale[] = ['be', 'ru']

// `Intl` locale used to format post dates.
export const dateLocale: Record<PostLocale, string> = {
    be: 'be-BY',
    ru: 'ru-RU'
}

// OpenGraph `og:locale` value per language.
export const ogLocale: Record<PostLocale, string> = {
    be: 'be_BY',
    ru: 'ru_RU'
}

// `<html lang>` / `hreflang` value per language.
export const htmlLang: Record<PostLocale, string> = {
    be: 'be',
    ru: 'ru'
}

export const indexRouteName: Record<PostLocale, RouteName> = {
    be: RouteName.Posts,
    ru: RouteName.PostsRu
}

export const postRouteName: Record<PostLocale, RouteName> = {
    be: RouteName.PostsPost,
    ru: RouteName.PostsRuPost
}

export const otherLocale: Record<PostLocale, PostLocale> = {
    be: 'ru',
    ru: 'be'
}

// URL path for a post / index in a given locale (used by SEO + sitemap parity).
export const indexPath: Record<PostLocale, string> = {
    be: '/posts/',
    ru: '/posts/ru/'
}

export const postPath = (locale: PostLocale, slug: string) =>
    locale === 'ru' ? `/posts/ru/${slug}/` : `/posts/${slug}/`

export type PostsCopy = {
    // Self-name of the language, used in the language switcher.
    langName: string
    // List page.
    eyebrow: string
    listTitle: string
    intro: string
    backHome: string
    // Post page.
    backToList: string
    toList: string
    notFoundTitle: string
    notFoundText: string
    switchLabel: string
    // SEO / share.
    siteName: string
    titleSuffix: string
    shareHint: string
    seoNotFoundTitle: string
    seoNotFoundDescription: string
}

export const postsCopy: Record<PostLocale, PostsCopy> = {
    be: {
        langName: 'Беларуская',
        eyebrow: 'Нататкі',
        listTitle: 'Запісы',
        intro: 'Невялікія нататкі пра жыццё, творчасць і не толькі.',
        backHome: 'Назад',
        backToList: 'Назад да запісаў',
        toList: 'Да спісу запісаў',
        notFoundTitle: 'Запіс не знойдзены',
        notFoundText: 'Старонка недаступная. Абяры іншы запіс са спісу.',
        switchLabel: 'Мова',
        siteName: 'Uladzimir Biarnatski',
        titleSuffix: 'Нататкі — Uladzimir Biarnatski',
        shareHint: 'Поўны тэкст і прыклады — на маім сайце.',
        seoNotFoundTitle: 'Запіс не знойдзены — Нататкі — Uladzimir Biarnatski',
        seoNotFoundDescription: 'Старонка недаступная.'
    },
    ru: {
        langName: 'Русский',
        eyebrow: 'Заметки',
        listTitle: 'Записи',
        intro: 'Небольшие заметки о жизни, творчестве и не только.',
        backHome: 'Назад',
        backToList: 'Назад к записям',
        toList: 'К списку записей',
        notFoundTitle: 'Запись не найдена',
        notFoundText: 'Страница недоступна. Выбери другую запись из списка.',
        switchLabel: 'Язык',
        siteName: 'Uladzimir Biarnatski',
        titleSuffix: 'Заметки — Uladzimir Biarnatski',
        shareHint: 'Полный текст и примеры — на моём сайте.',
        seoNotFoundTitle: 'Запись не найдена — Заметки — Uladzimir Biarnatski',
        seoNotFoundDescription: 'Страница недоступна.'
    }
}

// Belarusian is the default; anything else (home/CV) is English at the document level.
export const isPostLocale = (value: unknown): value is PostLocale =>
    value === 'be' || value === 'ru'
