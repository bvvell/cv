/**
 * Types for education, course and language items.
 *
 * Why:
 * - Keep `cv.json` data shape and component props aligned.
 */
export interface Education {
  school: string
  degree: string
  period: string
}

export interface Course {
  title: string
  url?: string
  year?: string
}

export interface Language {
  name: string
  level: string
}
