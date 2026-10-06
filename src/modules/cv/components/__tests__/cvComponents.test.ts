// @vitest-environment jsdom
import {mount} from '@vue/test-utils'
import {describe, expect, it} from 'vitest'
import CvHeader from '../cvHeader/cvHeader.vue'
import CvSkills from '../cvSkills/cvSkills.vue'
import CvSummary from '../cvSummary/cvSummary.vue'

describe('cv presentational components', () => {
    it('renders the summary', () => {
        const wrapper = mount(CvSummary, {props: {summary: 'Front-end developer.'}})
        expect(wrapper.get('h2').text()).toBe('Summary')
        expect(wrapper.get('p').text()).toBe('Front-end developer.')
    })

    it('renders skills and technologies lists', () => {
        const wrapper = mount(CvSkills, {
            props: {
                skills: {title: 'Skills', items: ['Vue 3', 'TypeScript']},
                technologies: {title: 'Technologies', items: ['Vite', 'SCSS']}
            }
        })
        const text = wrapper.text()
        expect(text).toContain('Skills')
        expect(text).toContain('Technologies')
        expect(text).toContain('Vue 3')
        expect(text).toContain('Vite')
    })

    it('renders the header with name and contacts', () => {
        const wrapper = mount(CvHeader, {
            props: {
                personal: {
                    name: 'Uladzimir Biarnatski',
                    location: 'Europe / Remote',
                    contacts: {
                        email: 'a@b.com',
                        linkedin: 'https://linkedin.com/in/x',
                        telegram: 'https://t.me/x'
                    }
                }
            }
        })
        expect(wrapper.get('h1').text()).toBe('Uladzimir Biarnatski')
        expect(wrapper.text()).toContain('a@b.com')
        expect(wrapper.text()).toContain('LinkedIn')
    })
})
