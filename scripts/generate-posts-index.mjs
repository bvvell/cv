import fs from 'node:fs'
import path from 'node:path'

/**
 * Generates `src/modules/posts/posts-index.json` from Markdown files.
 *
 * Why:
 * - The app needs a lightweight index for list pages and `<head>` meta (title/excerpt/cover).
 * - SSG needs the list of `/posts/:slug` routes (see `vite.config.js`).
 */
const root = process.cwd()
const postsDir = path.join(root, 'src', 'modules', 'posts', 'posts')
const outputPath = path.join(root, 'src', 'modules', 'posts', 'posts-index.json')

const stripFrontmatter = (raw) => {
  if (!raw.startsWith('---')) {
    return raw
  }
  const lines = raw.split(/\r?\n/)
  let bodyStartIndex = 0
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === '---') {
      bodyStartIndex = i + 1
      break
    }
  }
  return lines.slice(bodyStartIndex).join('\n').trim()
}

const parseFrontmatter = (raw) => {
  if (!raw.startsWith('---')) {
    return {}
  }
  const lines = raw.split(/\r?\n/)
  const frontMatter = {}

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i]
    if (line.trim() === '---') {
      break
    }
    const [key, ...rest] = line.split(':')
    if (!key) {
      continue
    }
    let value = rest.join(':').trim()
    if (!value) {
      continue
    }
    // Strip matching surrounding quotes so values stay consistent with the
    // strict YAML parser used at build time (values may be quoted to escape `:`).
    if (value.length >= 2 && (value[0] === '"' || value[0] === "'") && value[value.length - 1] === value[0]) {
      value = value.slice(1, -1)
    }
    frontMatter[key] = value
  }

  return frontMatter
}

const extractExcerpt = (body, maxLength = 180) => {
  // Excerpt = first one (or two) meaningful lines, trimmed to a reasonable share/snippet length.
  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length === 0) {
    return ''
  }
  let text = lines[0]
  if (text.length < maxLength && lines.length > 1) {
    text = `${text} ${lines[1]}`
  }
  if (text.length > maxLength) {
    text = `${text.slice(0, maxLength).trimEnd()}…`
  }
  return text.replace(/\s+/g, ' ')
}

const extractSlug = (filename) => filename.replace(/\.md$/, '')

// Why: Belarusian posts live in `posts/`, Russian translations in `posts/ru/`.
// The locale is derived from the folder so authors only manage Markdown files.
const localeDirs = [
  {locale: 'be', dir: postsDir},
  {locale: 'ru', dir: path.join(postsDir, 'ru')}
]

const readPosts = ({locale, dir}) => {
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((file) => file.endsWith('.md'))
    : []

  return files.map((file) => {
    const slug = extractSlug(file)
    const fullPath = path.join(dir, file)
    const raw = fs.readFileSync(fullPath, 'utf-8')
    const frontMatter = parseFrontmatter(raw)
    const body = stripFrontmatter(raw)

    return {
      slug,
      locale,
      title: frontMatter.title || slug,
      date: frontMatter.date || '1970-01-01',
      excerpt: frontMatter.excerpt || extractExcerpt(body),
      cover: frontMatter.cover || `/images/posts/${slug}.jpg`
    }
  })
}

const posts = localeDirs.flatMap(readPosts)

posts.sort((a, b) => {
  const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
  return dateDiff || a.slug.localeCompare(b.slug)
})

fs.mkdirSync(path.dirname(outputPath), {recursive: true})
fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2))
