import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const postsDir = path.join(root, 'src', 'posts', 'posts')
const outputPath = path.join(root, 'src', 'posts', 'posts-index.json')

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
    const value = rest.join(':').trim()
    if (!value) {
      continue
    }
    frontMatter[key] = value
  }

  return frontMatter
}

const extractExcerpt = (body, maxLength = 180) => {
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

const files = fs.existsSync(postsDir)
  ? fs.readdirSync(postsDir).filter((file) => file.endsWith('.md'))
  : []

const posts = files.map((file) => {
  const slug = extractSlug(file)
  const fullPath = path.join(postsDir, file)
  const raw = fs.readFileSync(fullPath, 'utf-8')
  const frontMatter = parseFrontmatter(raw)
  const body = stripFrontmatter(raw)

  return {
    slug,
    title: frontMatter.title || slug,
    date: frontMatter.date || '1970-01-01',
    excerpt: frontMatter.excerpt || extractExcerpt(body),
    cover: frontMatter.cover || `/images/posts/${slug}.jpg`
  }
})

posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

fs.mkdirSync(path.dirname(outputPath), {recursive: true})
fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2))
