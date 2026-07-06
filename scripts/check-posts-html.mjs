import {readFileSync, readdirSync, statSync} from 'fs'
import {join} from 'path'

const POSTS_DIRS = [
    'src/modules/posts/posts',
]

const DANGEROUS_PATTERNS = [
    {pattern: /<script[\s>]/gi, label: '<script>'},
    {pattern: /<[^>]*\bon\w+\s*=/gi, label: 'inline event handler (e.g. onerror=)'},
    {pattern: /href\s*=\s*["']?\s*javascript:/gi, label: 'javascript: URL'},
    {pattern: /src\s*=\s*["']?\s*data:/gi, label: 'data: URL in src'},
]

function collectMdFiles(dir) {
    const results = []
    for (const entry of readdirSync(dir)) {
        const fullPath = join(dir, entry)
        if (statSync(fullPath).isDirectory()) {
            results.push(...collectMdFiles(fullPath))
        } else if (entry.endsWith('.md')) {
            results.push(fullPath)
        }
    }
    return results
}

let hasErrors = false

for (const dir of POSTS_DIRS) {
    for (const file of collectMdFiles(dir)) {
        const content = readFileSync(file, 'utf8')
        for (const {pattern, label} of DANGEROUS_PATTERNS) {
            const matches = content.match(pattern)
            if (matches) {
                console.error(`[check-posts-html] FAIL ${file}: found ${label} (${matches.length} occurrence(s))`)
                hasErrors = true
            }
        }
    }
}

if (hasErrors) {
    console.error('[check-posts-html] Dangerous HTML found in posts. Build aborted.')
    process.exit(1)
} else {
    console.log('[check-posts-html] OK — no dangerous HTML found in posts.')
}
