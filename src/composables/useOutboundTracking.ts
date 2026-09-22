/**
 * Tracks clicks that leave the site or download a file.
 *
 * Why:
 * - The links worth measuring (CV PDF, email, socials, GPX files inside Markdown
 *   posts) live in half a dozen components and in post content, so one delegated
 *   listener beats wiring a handler into each of them.
 * - Pageviews alone cannot answer the only question these links exist for: does
 *   anyone actually download the CV or write?
 */
import {onBeforeUnmount, onMounted} from 'vue'
import {trackEvent} from '@/utils/analytics'

// Host (without `www.`) → contact channel, so social links report a stable name.
const CONTACT_HOSTS: Record<string, string> = {
    'linkedin.com': 'linkedin',
    'lnkd.in': 'linkedin',
    't.me': 'telegram',
    'instagram.com': 'instagram',
    'threads.net': 'threads',
    'threads.com': 'threads',
    'github.com': 'github'
}

const DOWNLOAD_EXTENSIONS = /\.(pdf|gpx|zip|csv)$/i

const contactChannel = (hostname: string) => CONTACT_HOSTS[hostname.replace(/^www\./, '')]

const handleClick = (event: MouseEvent) => {
    const target = event.target
    if (!(target instanceof Element)) return

    const link = target.closest('a[href]')
    if (!(link instanceof HTMLAnchorElement)) return

    const href = link.getAttribute('href') ?? ''
    if (href.startsWith('mailto:')) {
        trackEvent('contact', {channel: 'email'})
        return
    }

    let url: URL
    try {
        url = new URL(link.href, window.location.href)
    } catch {
        return
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') return

    if (url.origin === window.location.origin) {
        // Why: in-app browsers (Threads, Instagram) handle downloads poorly, so these
        // clicks are the only signal that a file was at least requested.
        if (link.hasAttribute('download') || DOWNLOAD_EXTENSIONS.test(url.pathname)) {
            trackEvent('download', {file: url.pathname})
        }
        return
    }

    const channel = contactChannel(url.hostname)
    trackEvent(channel ? 'contact' : 'outbound', channel
        ? {channel}
        : {link: `${url.hostname}${url.pathname}`})
}

export function useOutboundTracking() {
    onMounted(() => {
        // Capture phase: the click is recorded even when a handler stops propagation.
        document.addEventListener('click', handleClick, true)
    })

    onBeforeUnmount(() => {
        document.removeEventListener('click', handleClick, true)
    })
}
