import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

/**
 * Walks `public/images/posts/` and generates `.webp` siblings for `.jpg`/`.jpeg`/`.png`.
 *
 * Why:
 * - We want a cheap, idempotent step that authors can run after dropping a new image.
 * - Skips work when the `.webp` sibling already exists and is newer than the source.
 * - Does NOT replace source files; the build-time markdown plugin picks up `.webp` siblings
 *   when present and wraps `<img>` into `<picture>`.
 */
const root = process.cwd()
const targetDir = path.join(root, 'public', 'images', 'posts')

const WEBP_QUALITY = 78
const JPEG_QUALITY = 82

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
    await sharp(source).webp({quality: WEBP_QUALITY}).toFile(derived)
    return {skipped: false, derived}
}

const ensureJpgFromPng = async (source) => {
    // Why: PNG photos without alpha bloat — generate a JPG sibling for OG/social use
    // and let the markdown wrapper prefer .webp via <picture>.
    const meta = await sharp(source).metadata()
    if (meta.hasAlpha) return null
    const derived = source.replace(/\.png$/i, '.jpg')
    if (!needsRebuild(source, derived)) return {skipped: true, derived}
    await sharp(source).jpeg({quality: JPEG_QUALITY, mozjpeg: true}).toFile(derived)
    return {skipped: false, derived}
}

const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const sources = listFilesRecursive(targetDir).filter(isSourceImage)

let webpGenerated = 0
let jpgGenerated = 0

for (const source of sources) {
    const rel = path.relative(root, source)
    const webp = await ensureWebp(source)
    if (!webp.skipped) {
        webpGenerated += 1
        const sourceSize = fs.statSync(source).size
        const derivedSize = fs.statSync(webp.derived).size
        console.log(`webp: ${rel} → ${path.basename(webp.derived)} (${formatBytes(sourceSize)} → ${formatBytes(derivedSize)})`)
    }
    if (/\.png$/i.test(source)) {
        const jpg = await ensureJpgFromPng(source)
        if (jpg && !jpg.skipped) {
            jpgGenerated += 1
            const sourceSize = fs.statSync(source).size
            const derivedSize = fs.statSync(jpg.derived).size
            console.log(`jpg : ${rel} → ${path.basename(jpg.derived)} (${formatBytes(sourceSize)} → ${formatBytes(derivedSize)})`)
        }
    }
}

console.log(`done. webp: ${webpGenerated}, jpg-from-png: ${jpgGenerated}, scanned: ${sources.length}`)
