import {nextTick, onMounted} from 'vue'

/**
 * Adds a `loaded` CSS class after mount (optionally delayed).
 *
 * Why:
 * - Many pages animate in with CSS transitions; toggling a single class avoids JS-driven animations.
 * - Works with SSG: markup is pre-rendered, then the client enhances it.
 */
export function usePageLoader(elementId: string = 'page', delay: number = 0) {
    onMounted(async () => {
        await nextTick()
        const page = document.getElementById(elementId)
        if (page) {
            if (delay > 0) {
                setTimeout(() => {
                    page.classList.add('loaded')
                }, delay)
            } else {
                page.classList.add('loaded')
            }
        }
    })
}
