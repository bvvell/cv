import {spawn} from 'node:child_process'

/**
 * Browser smoke test against the built site (`dist/` via `pnpm preview`).
 *
 * Why: the HTTP-level `deploy:check` proves pages and files are served, but not that
 * the prerendered HTML actually contains the content (an SSG regression could ship
 * empty shells) or that client-side interactivity still hydrates. This walks the
 * key pages in a real Chromium and asserts the important bits are there.
 *
 * Run after `pnpm build`. Exits non-zero on any failed check.
 */
const BASE = 'http://127.0.0.1:4173'
const PORT = '4173'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForHttpOk = async (url, retries = 60, delayMs = 250) => {
    for (let i = 0; i < retries; i += 1) {
        try {
            const res = await fetch(url, {redirect: 'follow'})
            if (res.ok) return
        } catch {
            // not up yet; retry
        }
        await wait(delayMs)
    }
    throw new Error(`Preview server did not become ready at ${url}`)
}

const startPreviewServer = () => {
    const child = spawn('pnpm', ['preview', '--host', '127.0.0.1', '--port', PORT, '--strictPort'], {
        stdio: 'inherit',
        env: process.env
    })
    return child
}

const contentChecks = [
    {path: '/', text: 'Uladzimir Biarnatski', label: 'home name'},
    {path: '/cv/', text: 'Mindtech', label: 'cv experience'},
    {path: '/posts/', text: 'Запісы', label: 'be posts index'},
    {path: '/posts/ru/', text: 'Заметки', label: 'ru posts index'},
    {path: '/posts/kamni-200/', text: 'Камні 200', label: 'post body renders'},
]

const runContentChecks = async (page) => {
    let failed = 0
    for (const check of contentChecks) {
        await page.goto(`${BASE}${check.path}`, {waitUntil: 'networkidle'})
        const body = await page.content()
        const ok = body.includes(check.text)
        console.log(`${ok ? '✓' : '✗'} ${check.label} (${check.path})`)
        if (!ok) failed += 1
    }
    return failed
}

// Why: the worksheet is a lazy-loaded, client-side interactive widget — this proves
// it both hydrates and works after the per-post code-splitting.
const runLetterPlayCheck = async (page) => {
    await page.goto(`${BASE}/posts/letter-play/`, {waitUntil: 'networkidle'})
    await page.fill('#letter-play-text', 'Мама мыла раму')
    await page.click('.letter-play__controls button[type="submit"]')
    await page.waitForSelector('.letter-play__sheet', {timeout: 5_000})
    const rows = await page.locator('.letter-play__row').count()
    const ok = rows > 0
    console.log(`${ok ? '✓' : '✗'} letter-play generates rows (${rows})`)
    return ok ? 0 : 1
}

const main = async () => {
    const preview = startPreviewServer()
    try {
        await waitForHttpOk(`${BASE}/`)
        const {chromium} = await import('playwright')
        const browser = await chromium.launch()
        try {
            const page = await browser.newPage()
            let failed = await runContentChecks(page)
            failed += await runLetterPlayCheck(page)
            if (failed > 0) {
                console.error(`\n${failed} smoke check(s) failed`)
                process.exitCode = 1
            } else {
                console.log('\nall smoke checks passed')
            }
        } finally {
            await browser.close()
        }
    } finally {
        preview.kill('SIGTERM')
        await wait(250)
        if (!preview.killed) preview.kill('SIGKILL')
    }
}

await main()
