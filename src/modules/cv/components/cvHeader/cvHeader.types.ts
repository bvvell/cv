/**
 * Types for CV header props.
 *
 * Why:
 * - Keeps prop shape explicit and reusable.
 */
export interface Personal {
    name: string
    location: string
    contacts: {
        email: string
        linkedin: string
        telegram: string
    }
}
