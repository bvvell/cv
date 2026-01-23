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
            const addLoaded = () => page.classList.add('loaded')
            // Why: if we add the class before the first paint, CSS transitions won’t run.
            // Using rAF ensures the initial styles are committed before toggling.
            requestAnimationFrame(() => {
                if (delay > 0) setTimeout(addLoaded, delay)
                else addLoaded()
            })
        }
    })
}
