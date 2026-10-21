# bvvell.site

Personal site of Uladzimir Biarnatski: a home page, a CV and short posts in Belarusian
and Russian. Live at **https://bvvell.site**.

Vue 3 + TypeScript, prerendered to static HTML with **vite-ssg**. Posts are Markdown
compiled into Vue components at build time.

## ✅ Requirements

- **Node.js** `^20.19.0 || ^22.13.0 || >=24` (see `engines` in `package.json`)
- **pnpm** 10 (see `packageManager` in `package.json`)

## 🚀 Quick Start

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # static site in dist/
pnpm preview    # serve dist/ at http://localhost:4173
```

## 📄 Pages

| Route | What it is |
| --- | --- |
| `/` | Home page in English, Belarusian or Russian (detected from the browser, switchable) |
| `/cv/` | Full CV; also exported as `cv.pdf` (A4) on deploy |
| `/posts/`, `/posts/ru/` | Post lists, Belarusian and Russian |
| `/posts/:slug/`, `/posts/ru/:slug/` | A single post |
| anything else | 404 page |

## 📁 Project Structure

```
cv/
├── index.html                # Vite entry, Umami tracker
├── vite.config.js            # Vite, vite-ssg routes, Markdown + Shiki setup
├── public/                   # Static assets: icons, manifest, post images and files
├── scripts/                  # Build, release, deploy and check scripts (see Scripts)
├── .github/workflows/        # ci.yml (PRs), deploy.yml (main)
└── src/
    ├── main.ts               # App setup (vite-ssg), manual pageviews
    ├── App.vue
    ├── components/           # Shared UI (PageShell)
    ├── composables/          # useCvData, useSiteHead, usePageLoader, useOutboundTracking
    ├── data/
    │   ├── cv.json           # CV content
    │   └── cvData.ts         # CV data with placeholders filled in (import from here)
    ├── modules/              # Feature modules
    │   ├── home/             # Home page + be/ru copy
    │   ├── cv/               # CV page + section components
    │   ├── posts/            # Posts: Markdown, index, pages, in-post components
    │   └── notFound/         # 404 page
    ├── router/               # Routes and per-route SEO meta
    ├── styles/               # Tokens, mixins, common styles
    └── utils/                # Analytics, locale preference, URL helpers
```

## 📊 CV Data

All CV content lives in `src/data/cv.json`: personal info and contacts, summary,
skills and technologies, experience, projects, education, courses and languages.
The CV page and the PDF are rendered from it.

Years of experience are not written in the JSON: strings use the `{experienceYears}`
token, and the number lives in one constant, `EXPERIENCE_YEARS` in `src/data/cvData.ts`.
The same constant feeds the be/ru home meta line and the home page SEO description.
Import CV data from `@/data/cvData`, not from the JSON, so the token is always filled in.

English home page strings come from `cv.json` too (`personal.homeSubtitle`,
`personal.homeMeta`); the Belarusian and Russian ones are in `src/modules/home/data/homeCopy.ts`.

## 📝 Posts

Posts are Markdown files in `src/modules/posts/posts/`:

- `*.md` in the folder root are Belarusian (`/posts/:slug/`), the default locale;
- `ru/*.md` are Russian (`/posts/ru/:slug/`). A translation uses the same file name,
  which pairs the two versions for `hreflang` and the language switcher.

Each post starts with frontmatter:

```markdown
---
title: Post title
date: 2026-09-11
excerpt: "One or two sentences for the list page, meta description and feeds."
cover: /images/posts/my-post.jpg
---
```

Images go to `public/images/posts/` (`public/images/posts/ru/` for Russian covers);
downloadable files to `public/files/<slug>/`. Code blocks are highlighted with Shiki
(light and dark themes). Posts can embed Vue components from `src/modules/posts/components/`,
such as the life calendar.

On `pnpm dev` and `pnpm build` the site:

1. creates `.webp` variants of post images (`scripts/optimize-images.mjs`), served via `<picture>` with a `srcset`;
2. rebuilds `posts-index.json`, which holds list pages, `<head>` meta and SSG routes (`scripts/generate-posts-index.mjs`);
3. rejects raw HTML that could run code: `<script>`, inline handlers, `javascript:` and `data:` URLs (`scripts/check-posts-html.mjs`);
4. writes RSS feeds on build: `/feed.xml` (be) and `/feed.ru.xml` (ru).

A cover in the site's style (1200×630 OG card, optional sparkline) can be rendered with
`pnpm post:cover`; see the usage comment in `scripts/generate-post-cover.mjs`.

## 🛠️ Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Prepare posts (images, index, HTML check) and start the dev server |
| `pnpm build` | Prepare posts, prerender with vite-ssg, write `sitemap.xml`, `robots.txt` and RSS feeds |
| `pnpm preview` | Serve the built `dist/` |
| `pnpm lint` / `pnpm lint:fix` | ESLint, zero warnings allowed |
| `pnpm typecheck` | `vue-tsc` over the app, including templates |
| `pnpm test` / `pnpm test:watch` | Unit tests (Vitest) |
| `pnpm test:e2e` | Browser smoke test of key pages against the built site (Playwright) |
| `pnpm test:bundle` | Fail if any JS chunk exceeds the gzip budget |
| `pnpm cv:pdf` | Render `dist/cv.pdf` from the `/cv/` page (Playwright) |
| `pnpm post:cover` | Render a post cover (OG card) |
| `pnpm images:optimize` | Generate `.webp` variants for post images |
| `pnpm release` | Bump the patch version, commit and tag (used by CI) |
| `pnpm deploy:metadata` | Write `dist/version.json` with the deployed revision |
| `pnpm deploy:check` | Verify the live site serves that revision |

## ✔️ Quality Checks

- **Pre-commit:** husky + lint-staged run `eslint --fix` on staged files.
- **Pull requests** (`ci.yml`): lint, type-check, unit tests.
- **Deploy** (`deploy.yml`) repeats those and adds a check that `posts-index.json` is
  committed up to date, the build, the browser smoke test, the bundle budget and the
  PDF export, before anything is uploaded.

## 🚀 Deployment

Pushes to `main` build and deploy to **https://bvvell.site** (hoster.by, SFTP) via
`.github/workflows/deploy.yml`. The domain is not a secret — it lives in the workflow
as `SITE_URL` and is passed to the build as `VITE_SITE_URL`.

Each push to `main` first runs a `release` job that bumps the patch version
(`scripts/bump-version.mjs`), tags it, and stamps that version into `dist/version.json`,
so every deploy carries a fresh, monotonically increasing version.

Required secrets (repository, or scoped to the `production` environment):

| Secret | Meaning |
| --- | --- |
| `SFTP_HOST` | SFTP host |
| `SFTP_PORT` | SFTP port |
| `SFTP_USER` | SFTP user |
| `SFTP_PASSWORD` | SFTP password |
| `SFTP_TARGET` | Absolute path to the site docroot |

If any of them is missing the workflow still builds, then skips the upload with a
notice instead of failing.

`SFTP_TARGET` is the document root of the site itself (the directory that holds
`index.html`), not the home directory — the asset cleanup step refuses to run when
it cannot find a deployed site there.

After the upload, `pnpm deploy:check` fetches the live site and asserts that
`version.json` carries the revision just deployed and that every page, the sitemap,
both feeds and `cv.pdf` are served under the canonical domain. The same checks run
locally against a preview build:

```bash
pnpm preview
SITE_URL=https://bvvell.site DEPLOY_CHECK_BASE_URL=http://127.0.0.1:4173 pnpm deploy:check
```

### The previous domain

**bvvell.ru** is retired: the old hosting account answers every path with a 301 to
the matching URL on bvvell.site, so nothing is deployed or served there any more.
That redirect lives in the `.htaccess` of the *old* account and is not managed from
this repository. Its `google-site-verification` token has been dropped from
`index.html`; only the bvvell.site token remains.

## 🧠 SEO / `<head>`

- `<title>`, Open Graph, Twitter meta, canonical, `hreflang` and JSON-LD are managed via `@unhead/vue` in `src/composables/useSiteHead.ts`.
- Per-route `title` / `description` live in `src/router/index.ts` (`route.meta`); posts take theirs from frontmatter.
- Set `VITE_SITE_URL` to generate absolute `og:url`, `og:image` and canonical URLs during SSG.
- `sitemap.xml` and `robots.txt` are generated in `pnpm build` via `scripts/generate-sitemap.mjs`.
- Avoid direct `document`/`window` access during SSG/SSR; guard with `if (!import.meta.env.SSR)` or run DOM code in `onMounted()`.

## 📈 Analytics

Umami, loaded from `index.html` with automatic pageviews off: the router reports
pageviews itself, so `/cv` and `/cv/` are not counted twice. Clicks that leave the site
or download a file (CV PDF, email, socials, post files) are tracked by `useOutboundTracking`. Helpers in `src/utils/analytics.ts` never throw: when the
tracker is blocked, calls become no-ops.

Performance work done so far is described in [`OPTIMIZATIONS.md`](OPTIMIZATIONS.md).

## 📝 License

Personal project.
