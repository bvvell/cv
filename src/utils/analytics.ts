/**
 * Umami analytics helpers.
 *
 * Why:
 * - Automatic pageviews are off (`data-auto-pageview` in `index.html`): the tracker
 *   reports the raw initial URL, so `/cv` was counted before the router normalized
 *   it to `/cv/` — one visit, two pageviews. `src/main.ts` reports them instead.
 * - The tracker script is deferred, so the first calls happen before `window.umami`
 *   exists; they wait in a queue until it does.
 * - Nothing here throws or blocks: when the tracker never arrives (dev host, blocked
 *   script) the queue is dropped after a short grace period and calls become no-ops.
 */
type UmamiPayload = Record<string, unknown>

type UmamiTracker = {
    track: (
        payload?: string | UmamiPayload | ((props: UmamiPayload) => UmamiPayload),
        data?: UmamiPayload
    ) => void
}

declare global {
    interface Window {
        umami?: UmamiTracker
    }
}

const POLL_INTERVAL_MS = 200
const POLL_TIMEOUT_MS = 10000

const pending: ((tracker: UmamiTracker) => void)[] = []
let waited = 0
let polling = false
let unavailable = false

const poll = () => {
    const tracker = window.umami
    if (tracker) {
        polling = false
        waited = 0
        while (pending.length) {
            pending.shift()?.(tracker)
        }
        return
    }

    waited += POLL_INTERVAL_MS
    if (waited >= POLL_TIMEOUT_MS) {
        // The tracker is not coming: stop polling and forget what was queued.
        polling = false
        unavailable = true
        pending.length = 0
        return
    }

    window.setTimeout(poll, POLL_INTERVAL_MS)
}

const withTracker = (fn: (tracker: UmamiTracker) => void) => {
    if (typeof window === 'undefined' || unavailable) return

    const tracker = window.umami
    if (tracker) {
        fn(tracker)
        return
    }

    pending.push(fn)
    if (!polling) {
        polling = true
        window.setTimeout(poll, POLL_INTERVAL_MS)
    }
}

/** Reports a pageview. `url` must already be normalized (trailing slash included). */
export const trackPageview = (url: string) => {
    withTracker((tracker) => tracker.track((props) => ({...props, url})))
}

/** Reports a named event with an optional flat payload. */
export const trackEvent = (name: string, data?: UmamiPayload) => {
    withTracker((tracker) => (data ? tracker.track(name, data) : tracker.track(name)))
}
