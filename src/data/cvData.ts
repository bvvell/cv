import rawCvData from './cv.json'

/**
 * Years of experience, shown on the CV, the home page and in SEO text.
 *
 * Why:
 * - One number, many places: the CV summary, the home meta line (en/be/ru) and the
 *   home page description all say it. Bumping it once a year should touch one line.
 * - A fixed string, not a value computed from the current date: the site is
 *   prerendered, and a number that changes between build and visit would flip on hydration.
 */
export const EXPERIENCE_YEARS = '10+'

const EXPERIENCE_YEARS_TOKEN = '{experienceYears}'

/**
 * CV data from `cv.json` with `{experienceYears}` filled in.
 *
 * Why:
 * - `cv.json` stays plain content; the token lets its strings mention the number
 *   without repeating it. Import CV data from here, not from the JSON directly,
 *   so no consumer ever sees the raw token.
 */
export const cvData = JSON.parse(
    JSON.stringify(rawCvData).split(EXPERIENCE_YEARS_TOKEN).join(EXPERIENCE_YEARS)
) as typeof rawCvData
