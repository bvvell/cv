import fs from 'node:fs'
import path from 'node:path'
import {execFileSync} from 'node:child_process'

/**
 * Bumps the patch version, commits the change and tags it.
 *
 * Why a tiny script instead of `standard-version`: we only ever bump the patch
 * version on each push, and standard-version drags in a deprecated dependency chain
 * (conventional-changelog → handlebars and friends) with dozens of audit findings.
 * A 30-line script does the same job with zero dependencies.
 *
 * Usage: node scripts/bump-version.mjs [patch|minor|major]   (default: patch)
 */
const root = process.cwd()
const pkgPath = path.join(root, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

const bump = process.argv[2] || 'patch'
const parts = pkg.version.split('.').map(Number)
const index = bump === 'major' ? 0 : bump === 'minor' ? 1 : 2
parts[index] += 1
for (let i = index + 1; i < parts.length; i += 1) parts[i] = 0

const next = parts.join('.')
pkg.version = next
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

// Why commit+tag here: CI runs this after configuring the bot identity, then pushes
// with `--follow-tags`. Locally it mirrors what `standard-version` used to do.
execFileSync('git', ['add', 'package.json'], {cwd: root})
execFileSync('git', ['commit', '-m', `chore(release): ${next}`], {cwd: root})
execFileSync('git', ['tag', `v${next}`], {cwd: root})

console.log(`bumped ${bump}: ${pkg.version} → ${next}`)
