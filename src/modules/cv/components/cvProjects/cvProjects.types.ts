/**
 * Types for projects section.
 *
 * Why:
 * - Keeps the project data structure consistent and explicit (name, impact, stack, etc.).
 */
export interface ProjectsSection {
  title: string
  items: readonly Project[]
}

export interface Project {
  name: string
  url?: string
  summary: string
  contribution: readonly string[]
  impact?: string
  stack?: string
}
