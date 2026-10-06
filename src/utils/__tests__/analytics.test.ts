// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

/**
 * Loads the analytics module with a fresh module registry so its module-level
 * queue state does not leak between tests.
 */
const loadAnalytics = async () => {
    vi.resetModules()
    return import('../analytics')
}

describe('analytics', () => {
    let umamiTrack: ReturnType<typeof vi.fn>

    beforeEach(() => {
        vi.useFakeTimers()
        umamiTrack = vi.fn()
    })

    afterEach(() => {
        vi.useRealTimers()
        delete window.umami
    })

    it('queues events until the tracker appears, then flushes them', async () => {
        const {trackEvent, trackPageview} = await loadAnalytics()

        trackPageview('/cv/')
        trackEvent('download', {file: '/cv.pdf'})
        expect(umamiTrack).not.toHaveBeenCalled()

        window.umami = {track: umamiTrack}
        await vi.advanceTimersByTimeAsync(200)

        expect(umamiTrack).toHaveBeenCalledTimes(2)
    })

    it('drops the queue after the grace period and becomes a no-op', async () => {
        const {trackEvent} = await loadAnalytics()

        trackEvent('contact', {channel: 'email'})
        await vi.advanceTimersByTimeAsync(10_000 + 200)

        // The tracker arrives too late: the module has given up.
        window.umami = {track: umamiTrack}
        trackEvent('contact', {channel: 'telegram'})

        expect(umamiTrack).not.toHaveBeenCalled()
    })

    it('calls the tracker immediately once it is already present', async () => {
        const {trackEvent} = await loadAnalytics()

        window.umami = {track: umamiTrack}
        trackEvent('rss-click', {locale: 'be'})

        expect(umamiTrack).toHaveBeenCalledTimes(1)
    })
})
