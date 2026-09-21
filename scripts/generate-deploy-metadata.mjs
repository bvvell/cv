import {execFileSync} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Writes `dist/version.json` with the revision that produced the build.
 *
 * Why: an SFTP upload reports success even when the host keeps serving the
 * previous build (or a parking page), so `check-deployment.mjs` needs a marker
 * it can fetch and compare against the commit CI has just deployed.
 */
const root = process.cwd()
const distDir = path.join(root, 'dist')

const packageJson = JSON.parse(
    fs.readFileSync(path.join(root, 'package.json'), 'utf8')
)

const currentRevision = () => {
    const revision = process.env.GITHUB_SHA
        || execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim()
    if (!/^[a-f0-9]{40}$/i.test(revision)) {
        throw new Error('Deploy revision must be a full Git commit SHA.')
    }
    return revision.toLowerCase()
}

const revision = currentRevision()
const metadata = {
    appVersion: packageJson.version,
    revision,
    shortRevision: revision.slice(0, 7),
    deployedAt: new Date().toISOString(),
    runNumber: process.env.GITHUB_RUN_NUMBER ?? null
}

fs.mkdirSync(distDir, {recursive: true})
const target = path.join(distDir, 'version.json')
fs.writeFileSync(target, `${JSON.stringify(metadata, null, 2)}\n`)
console.log(`wrote ${target}`)

// The upload overwrites but never deletes, so the host accumulates every file
// any past build produced. This manifest lets the deploy prune what the current
// build no longer contains, without guessing from timestamps.
const MANIFEST = '.deploy-manifest'

const collect = (dir, prefix = '') => {
    const found = []
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const relative = prefix ? `${prefix}/${entry.name}` : entry.name
        if (entry.name === MANIFEST) continue
        if (entry.isDirectory()) {
            found.push(...collect(path.join(dir, entry.name), relative))
        } else {
            found.push(relative)
        }
    }
    return found
}

const files = collect(distDir).sort()
const manifest = path.join(distDir, MANIFEST)
fs.writeFileSync(manifest, `${files.join('\n')}\n`)
console.log(`wrote ${manifest} (${files.length} files)`)
