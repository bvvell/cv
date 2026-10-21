import {describe, expect, it} from 'vitest'
import {EXPERIENCE_YEARS, cvData} from '../cvData'

describe('cvData', () => {
    it('fills the experience years into the CV text', () => {
        expect(cvData.summary).toContain(`${EXPERIENCE_YEARS} years`)
        expect(cvData.personal.homeMeta).toContain(`${EXPERIENCE_YEARS} years`)
    })

    it('leaves no unresolved tokens anywhere in the data', () => {
        expect(JSON.stringify(cvData)).not.toMatch(/\{experienceYears\}/)
    })
})
