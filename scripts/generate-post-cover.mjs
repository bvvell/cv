import fs from 'node:fs'
import path from 'node:path'

/**
 * Renders a 1200x630 post cover (OG card) with Playwright and writes it as JPEG.
 *
 * Why:
 * - Covers should look like the site, so the card is plain HTML built on the same
 *   palette as `src/styles/_tokens.scss` instead of a hand-made image.
 * - The optional sparkline lets a post put its own numbers on the card
 *   (HRV over a taper, weekly volume, anything with a shape).
 *
 * Usage:
 *   node scripts/generate-post-cover.mjs --slug my-post --locale be \
 *     --eyebrow "120 км гравію" --title "Падводка" \
 *     --subtitle "План максімальна складаны." \
 *     --caption "HRV за 11 дзён" --data 39,49,48,40,43,46,62,35,45
 *
 * `--out` overrides the derived path; run `pnpm images:optimize` afterwards
 * to get the `.webp` sibling.
 */
const root = process.cwd()

const WIDTH = 1200
const HEIGHT = 630
const JPEG_QUALITY = 90

// Mirrors the light palette in `src/styles/_tokens.scss`.
const TOKENS = {
  paper: '#f5f2ec',
  ink: '#2a271f',
  inkBody: '#4d483d',
  muted: '#766f60',
  accent: '#b45d3c',
  accentInk: '#9a4a2e',
  dot: '#c0b8a6',
  hairline: 'rgba(60, 54, 42, 0.14)'
}

const FONT_PATH = path.join(
  root,
  'node_modules/@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2'
)

const usage = `Usage: node scripts/generate-post-cover.mjs --title <text> (--slug <slug> | --out <path>)

  --title      Big line on the card (required)
  --slug       Post slug; with --locale it derives the output path
  --locale     be (default) or ru
  --out        Explicit output path, wins over --slug
  --eyebrow    Small uppercase line above the title
  --subtitle   Sentence under the title
  --caption    Small line under the sparkline
  --data       Comma-separated numbers; omit to render the card without a chart
`

const parseArgs = (argv) => {
  const args = {}
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith('--')) {
      continue
    }
    const [key, inlineValue] = token.slice(2).split('=')
    // Support both `--key value` and `--key=value`.
    const value = inlineValue ?? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i += 1] : '')
    args[key] = value
  }
  return args
}

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

const parseSeries = (raw) => {
  if (!raw) {
    return []
  }
  const values = raw.split(',').map((part) => Number(part.trim()))
  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error(`--data must be comma-separated numbers, got: ${raw}`)
  }
  if (values.length < 2) {
    throw new Error('--data needs at least two points to draw a line')
  }
  return values
}

const renderChart = (values) => {
  if (values.length === 0) {
    return ''
  }
  const w = 1040
  const h = 150
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min
  const x = (index) => (index / (values.length - 1)) * w
  // A flat series has no range to scale against; draw it down the middle.
  const y = (value) => (span === 0 ? h / 2 : h - ((value - min) / span) * h)

  const points = values.map((value, index) => [x(index), y(value)])
  const line = points.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ')
  const lowIndex = values.indexOf(min)
  const dots = points
    .map(([px, py], index) => (index === lowIndex
      ? `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="9" fill="${TOKENS.accent}"/>`
      : `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5" fill="${TOKENS.paper}" stroke="${TOKENS.accent}" stroke-width="3"/>`))
    .join('')

  // The dashed rule marks the series average, so the dips read as dips.
  const average = values.reduce((sum, value) => sum + value, 0) / values.length

  return `
    <svg class="chart" viewBox="-12 -16 ${w + 24} ${h + 32}" width="${w}" height="${h + 16}">
      <line x1="0" y1="${y(average).toFixed(1)}" x2="${w}" y2="${y(average).toFixed(1)}"
            stroke="rgba(60,54,42,0.18)" stroke-width="2" stroke-dasharray="6 8"/>
      <polyline points="${line}" fill="none" stroke="${TOKENS.accent}" stroke-width="5"
                stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}
    </svg>`
}

const renderPage = ({fontData, eyebrow, title, subtitle, caption, values}) => {
  const chart = renderChart(values)
  const foot = caption
    ? `<div class="foot"><span class="caption">${escapeHtml(caption)}</span></div>`
    : ''

  return `
<style>
  @font-face {
    font-family: 'Public Sans';
    src: url(data:font/woff2;base64,${fontData}) format('woff2-variations');
    font-weight: 100 900;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px; height: ${HEIGHT}px; position: relative; overflow: hidden;
    font-family: 'Public Sans', -apple-system, 'Helvetica Neue', Arial, sans-serif;
    background:
      radial-gradient(130% 130% at 0% 0%,     #f8ecdd 0%, rgba(248, 236, 221, 0) 46%),
      radial-gradient(130% 130% at 100% 100%, #e4efe8 0%, rgba(228, 239, 232, 0) 52%),
      ${TOKENS.paper};
  }
  /* Dot grid echoes the gravel motif of the Камні 200 cover. */
  .dots {
    position: absolute; inset: 0;
    background-image: radial-gradient(${TOKENS.dot} 2px, transparent 2px);
    background-size: 26px 26px;
    opacity: 0.35;
    -webkit-mask-image: linear-gradient(105deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 58%);
  }
  .inner {
    position: relative; height: 100%;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 72px 80px 64px;
  }
  .eyebrow {
    font-size: 19px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
    color: ${TOKENS.accentInk};
  }
  h1 {
    margin-top: 26px;
    font-size: 88px; font-weight: 800; letter-spacing: -0.035em; line-height: 1;
    color: ${TOKENS.ink};
  }
  .subtitle {
    margin-top: 22px; max-width: 900px;
    font-size: 30px; font-weight: 400; line-height: 1.3; color: ${TOKENS.inkBody};
  }
  .chart-row { display: flex; align-items: flex-end; gap: 28px; }
  .chart { display: block; }
  .foot {
    display: flex; align-items: baseline; justify-content: space-between;
    margin-top: 26px;
    border-top: 1px solid ${TOKENS.hairline}; padding-top: 18px;
  }
  .caption { font-size: 19px; color: ${TOKENS.muted}; }
</style>
<div class="dots"></div>
<div class="inner">
  <div>
    ${eyebrow ? `<div class="eyebrow">${escapeHtml(eyebrow)}</div>` : ''}
    <h1>${escapeHtml(title)}</h1>
    ${subtitle ? `<div class="subtitle">${escapeHtml(subtitle)}</div>` : ''}
  </div>
  <div>
    ${chart ? `<div class="chart-row">${chart}</div>` : ''}
    ${foot}
  </div>
</div>`
}

const resolveOutPath = ({out, slug, locale}) => {
  if (out) {
    return path.isAbsolute(out) ? out : path.join(root, out)
  }
  if (!slug) {
    throw new Error('Pass either --out or --slug')
  }
  const localeDir = locale === 'ru' ? path.join('posts', 'ru') : 'posts'
  return path.join(root, 'public', 'images', localeDir, `${slug}.jpg`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (!args.title) {
    process.stdout.write(usage)
    process.exitCode = 1
    return
  }

  const locale = args.locale || 'be'
  if (locale !== 'be' && locale !== 'ru') {
    throw new Error(`--locale must be be or ru, got: ${locale}`)
  }

  const outPath = resolveOutPath({out: args.out, slug: args.slug, locale})
  const values = parseSeries(args.data)
  const fontData = fs.readFileSync(FONT_PATH).toString('base64')

  const {chromium} = await import('playwright')
  const sharp = (await import('sharp')).default

  const browser = await chromium.launch()
  try {
    // Render at 2x so text stays crisp after the downscale to 1200x630.
    const page = await browser.newPage({
      viewport: {width: WIDTH, height: HEIGHT},
      deviceScaleFactor: 2
    })
    await page.setContent(renderPage({
      fontData,
      eyebrow: args.eyebrow,
      title: args.title,
      subtitle: args.subtitle,
      caption: args.caption,
      values
    }), {waitUntil: 'load'})
    await page.evaluate(() => document.fonts.ready)

    const shot = await page.screenshot({type: 'png'})
    fs.mkdirSync(path.dirname(outPath), {recursive: true})
    await sharp(shot)
      .resize(WIDTH, HEIGHT)
      .jpeg({quality: JPEG_QUALITY, chromaSubsampling: '4:4:4'})
      .toFile(outPath)
  } finally {
    await browser.close()
  }

  console.log(`cover: ${path.relative(root, outPath)} — run \`pnpm images:optimize\` for the webp sibling`)
}

await main()
