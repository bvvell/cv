import fs from 'node:fs'
import path from 'node:path'
import {gzipSync} from 'node:zlib'

/**
 * Fails the build when a single JS chunk exceeds the budget (gzip).
 *
 * Why: per-post code-splitting keeps `postsPostPage` at ~3 KB gzip and the vendor
 * chunks small; this guard catches a future change that accidentally bundles
 * everything back into one large chunk.
 *
 * Run after `pnpm build`.
 */
const distAssets = path.join(process.cwd(), 'dist', 'assets')
const MAX_CHUNK_GZIP = 60 * 1024 // 60 KB

const files = fs.readdirSync(distAssets).filter((file) => file.endsWith('.js'))
const sizes = files
    .map((file) => {
        const raw = fs.readFileSync(path.join(distAssets, file))
        return {file, gzip: gzipSync(raw).length}
    })
    .sort((a, b) => b.gzip - a.gzip)

for (const {file, gzip} of sizes) {
    console.log(`  ${file}: ${(gzip / 1024).toFixed(2)} KB gzip`)
}

const largest = sizes[0]
if (!largest) {
    console.error('No JS assets found in dist/assets')
    process.exit(1)
}

if (largest.gzip > MAX_CHUNK_GZIP) {
    console.error(
        `Bundle budget exceeded: ${largest.file} is ${(largest.gzip / 1024).toFixed(1)} KB gzip`
        + ` (limit ${MAX_CHUNK_GZIP / 1024} KB).`
    )
    process.exit(1)
}

console.log(`bundle budget OK (largest: ${(largest.gzip / 1024).toFixed(1)} KB gzip)`)
