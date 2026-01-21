/**
 * Types for skills-like sections.
 *
 * Why:
 * - Both `skills` and `technologies` use the same shape (title + items list).
 */
export interface SkillsSection {
  title: string
  items: readonly string[]
}
