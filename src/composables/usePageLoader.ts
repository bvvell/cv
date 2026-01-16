import {nextTick, onMounted} from 'vue'

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

