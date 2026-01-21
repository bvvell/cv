/**
 * Types for work experience items.
 *
 * Why:
 * - Ensures consistent structure between `cv.json` and the component props.
 */
export interface Experience {
  company: string
  position: string
  period: string
  description: readonly string[]
  tags?: readonly string[]
}
