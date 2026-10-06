import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

/**
 * Walks `public/images/posts/` and generates a resized `.webp` sibling for every
 * `.jpg`/`.jpeg`/`.png`.
 *
 * Why:
 * - The build-time Markdown plugin serves `.webp` through `<picture>` whenever a
 *   sibling exists, so the WebP size is what every modern visitor actually pays.
 * - Resizing to a max width keeps the WebP small without touching the source file
 *   (the source remains the non-WebP fallback).
 * - Idempotent: skips work when the `.webp` sibling is already newer than its source.
 *
 * Note: we deliberately do NOT auto-generate `.jpg` copies from PNGs. That used to
 * produce orphan files nothing referenced, because posts keep referencing the `.png`
 * and the `<picture>` wrapper already prefers `.webp`.
 */
const root = process.cwd()
const targetDir = path.join(root, 'public', 'images', 'posts')

const WEBP_QUALITY = 78
const MAX_WIDTH = 1600

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

const ensureWebp = async (source) => {
    const derived = source.replace(/\.(jpe?g|png)$/i, '.webp')
    if (!needsRebuild(source, derived)) return {skipped: true, derived}
    await sharp(source)
        .rotate()
        .resize({width: MAX_WIDTH, withoutEnlargement: true})
        .webp({quality: WEBP_QUALITY})
        .toFile(derived)
    return {skipped: false, derived}
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
    const webp = await ensureWebp(source)
    if (!webp.skipped) {
        webpGenerated += 1
        const sourceSize = fs.statSync(source).size
        const derivedSize = fs.statSync(webp.derived).size
        console.log(`webp: ${rel} → ${path.basename(webp.derived)} (${formatBytes(sourceSize)} → ${formatBytes(derivedSize)})`)
    }
}

console.log(`done. webp: ${webpGenerated}, scanned: ${sources.length}`)
