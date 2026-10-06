import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

/**
 * Walks `public/images/posts/` and generates resized `.webp` siblings for every
 * `.jpg`/`.jpeg`/`.png`.
 *
 * Why:
 * - The build-time Markdown plugin serves `.webp` through `<picture>` whenever a
 *   sibling exists, so the WebP size is what every modern visitor actually pays.
 * - A full-size WebP plus a few fixed-width variants let the plugin emit a proper
 *   `srcset`, so phones download a small image instead of the full one.
 * - Idempotent: skips work when a derived file is already newer than its source.
 *
 * Note: we deliberately do NOT auto-generate `.jpg` copies from PNGs. That used to
 * produce orphan files nothing referenced, because posts keep referencing the `.png`
 * and the `<picture>` wrapper already prefers `.webp`.
 */
const root = process.cwd()
const targetDir = path.join(root, 'public', 'images', 'posts')

const WEBP_QUALITY = 78
// Widths emitted for `srcset` (exact pixel widths; see `vite.config.js`).
const SRCSET_WIDTHS = [480, 800, 1200]

const isSourceImage = (file) => /\.(jpe?g|png)$/i.test(file)

const listFilesRecursive = (dir) => {
    if (!fs.existsSync(dir)) return []
    const out = []
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) out.push(...listFilesRecursive(full))
        else if (entry.isFile()) out.push(full)
    }
    return out
}

const needsRebuild = (source, derived) => {
    if (!fs.existsSync(derived)) return true
    return fs.statSync(source).mtimeMs > fs.statSync(derived).mtimeMs
}

const renderWebp = (source, derived, width) =>
    sharp(source)
        .rotate()
        .resize({width})
        .webp({quality: WEBP_QUALITY})
        .toFile(derived)

const ensureWebp = async (source) => {
    const generated = []

    for (const width of SRCSET_WIDTHS) {
        const variant = source.replace(/\.(jpe?g|png)$/i, `-${width}.webp`)
        if (needsRebuild(source, variant)) {
            await renderWebp(source, variant, width)
            generated.push(variant)
        }
    }

    return generated
}

const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const sources = listFilesRecursive(targetDir).filter(isSourceImage)

let webpGenerated = 0

for (const source of sources) {
    const rel = path.relative(root, source)
    const generated = await ensureWebp(source)
    for (const derived of generated) {
        webpGenerated += 1
        const sourceSize = fs.statSync(source).size
        const derivedSize = fs.statSync(derived).size
        console.log(`webp: ${rel} → ${path.basename(derived)} (${formatBytes(sourceSize)} → ${formatBytes(derivedSize)})`)
    }
}

console.log(`done. webp: ${webpGenerated}, scanned: ${sources.length}`)
