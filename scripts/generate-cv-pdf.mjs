import {spawn} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_URL = 'http://127.0.0.1:4173/cv/'
const DEFAULT_OUT = path.join(process.cwd(), 'dist', 'cv.pdf')

const url = process.argv[2] || DEFAULT_URL
const outPath = process.argv[3] || DEFAULT_OUT

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForHttpOk(targetUrl, retries = 60, delayMs = 250) {
  // Node 20+ has global fetch
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await fetch(targetUrl, {redirect: 'follow'})
      if (res.ok) {
        return
      }
    } catch {
      // ignore and retry
    }
    await wait(delayMs)
  }
  throw new Error(`Preview server did not become ready at ${targetUrl}`)
}

function startPreviewServer() {
  // `pnpm preview` uses Vite preview and serves `dist/`
  const child = spawn('pnpm', ['preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
    stdio: 'inherit',
    env: process.env
  })
  return child
}

async function main() {
  const preview = startPreviewServer()

  try {
    await waitForHttpOk(url)

    const {chromium} = await import('playwright')
    fs.mkdirSync(path.dirname(outPath), {recursive: true})

    const browser = await chromium.launch()
    const page = await browser.newPage({viewport: {width: 1280, height: 720}})
    await page.goto(url, {waitUntil: 'networkidle'})
    await page.pdf({
      path: outPath,
      printBackground: false,
      preferCSSPageSize: true
    })
    await browser.close()
  } finally {
    preview.kill('SIGTERM')
    await wait(250)
    if (!preview.killed) {
      preview.kill('SIGKILL')
    }
  }
}

await main()
