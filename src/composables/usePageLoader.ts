import {type Ref, watch} from 'vue'

/**
 * Adds a `loaded` CSS class once the element ref is populated (optionally delayed).
 *
 * Why:
 * - Many pages animate in with CSS transitions; toggling a single class avoids JS-driven animations.
 * - Works with SSG: markup is pre-rendered, then the client enhances it.
 * - Using watch instead of onMounted to handle vite-ssg hydration timing where refs
 *   may not be populated synchronously before onMounted fires.
 */
export function usePageLoader(el: Ref<HTMLElement | null>, delay: number = 0) {
    const unwatch = watch(el, (elem) => {
        if (!elem) return
        const addLoaded = () => elem.classList.add('loaded')
        // Why: if we add the class before the first paint, CSS transitions won't run.
        // Using rAF ensures the initial styles are committed before toggling.
        requestAnimationFrame(() => {
            if (delay > 0) setTimeout(addLoaded, delay)
            else addLoaded()
        })
        unwatch()
    }, {immediate: true})
}
