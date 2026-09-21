# CV - Uladzimir Biarnatski

Modern CV website built with **Vue 3**, **TypeScript**, **Vue Router**, and **Vite**.

## ✅ Requirements

- **Node.js**: `^20.19.0 || >=22.12.0` (SSG build relies on modern Node; Node 22 support starts at 22.12)
- Package manager: `pnpm` (see `packageManager` in `package.json`)

## 🚀 Quick Start

### Install dependencies
```bash
pnpm install
```

### Run dev server
```bash
pnpm dev
```
Opens at `http://localhost:5173`

### Build for production
```bash
pnpm build
```

### Preview production build
```bash
pnpm preview
```

## 📁 Project Structure

```
cv/
├── index.html                    # Vite entry point
├── vite.config.js                # Vite configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.js              # ESLint configuration
│
├── public/                       # Static assets
│   ├── favicon.ico
│   └── av.png                    # Avatar
│
└── src/
    ├── main.ts                   # Vue app initialization
    ├── App.vue                   # Root component
    ├── style.scss                # Global styles / tokens
    ├── composables/              # App-wide composables
    │   ├── useCvData.ts
    │   ├── usePageLoader.ts
    │   └── useSiteHead.ts        # SEO/meta via @unhead/vue
    │
    ├── modules/                  # Feature modules
    │   ├── home/                 # Home page
    │   ├── cv/                   # CV page + components
    │   ├── posts/                # Posts (Markdown + SSG)
    │   └── notFound/             # 404 page
    │
    ├── router/
    │   └── index.ts              # Vue Router configuration
    │
    └── data/
        └── cv.json               # CV data
```

## ✨ Technologies

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vue Router** for navigation
- **Vite** for fast development and builds
- **SCSS** for styles
- **ESLint** for code quality

## 📄 Pages

- **Home** (`/`) - Landing page with animation
- **CV** (`/cv/`) - Full CV with work experience, skills, education
- **Posts** (`/posts/`) - Short posts (SSG)

## 📊 CV Data

All data is stored in `src/data/cv.json`:
- Personal information (name, contacts)
- Summary
- Skills and technologies
- Education and courses
- Work experience

To update your CV, simply edit the `cv.json` file.

## 🛠️ Scripts

- `pnpm dev` - Start dev server
- `pnpm build` - Static build (SSG) to `dist/` (also generates `sitemap.xml` + `robots.txt`)
- `pnpm cv:pdf` - Generate `dist/cv.pdf` from the `/cv` page (Playwright)
- `pnpm preview` - Preview production build
- `pnpm lint` - Lint code
- `pnpm lint:fix` - Auto-fix linting errors
- `pnpm deploy:metadata` - Write `dist/version.json` with the deployed revision
- `pnpm deploy:check` - Verify the live site serves that revision

## 🚀 Deployment

Pushes to `main` build and deploy to **https://bvvell.site** (hoster.by, SFTP) via
`.github/workflows/deploy.yml`. The domain is not a secret — it lives in the workflow
as `SITE_URL` and is passed to the build as `VITE_SITE_URL`.

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

**bvvell.ru** keeps running in parallel for now, still served by the old hosting
account from its last deploy. This repository no longer deploys there, so that copy
is frozen and keeps its own canonical URLs — expect the two domains to look like
duplicate content until the redirect is in place.

Once bvvell.site is confirmed working, point the old domain at it with a 301 in the
`.htaccess` of the *old* hosting account (not deployed from this repository):

```apache
RewriteEngine On
RewriteRule ^(.*)$ https://bvvell.site/$1 [R=301,L]
```

Both domains are listed in the umami `data-domains` attribute in `index.html`, so
analytics keeps working while they run side by side.

## 🧠 SEO / `<head>`

- `<title>`, Open Graph, Twitter meta, canonical, and JSON-LD are managed via `@unhead/vue` in `src/composables/useSiteHead.ts`.
- Per-route `title` / `description` live in `src/router/index.ts` (`route.meta`).
- Set `VITE_SITE_URL` to generate absolute `og:url`, `og:image` and canonical URLs during SSG.
- `sitemap.xml` and `robots.txt` are generated in `pnpm build` via `scripts/generate-sitemap.mjs`.
- Avoid direct `document`/`window` access during SSG/SSR; guard with `if (!import.meta.env.SSR)` or run DOM code in `onMounted()`.

## 📦 Dependencies

### Production
- `vue` - Vue 3 framework
- `vue-router` - Routing

### Development
- `typescript` - TypeScript compiler
- `vite` - Build tool
- `@vitejs/plugin-vue` - Vue plugin for Vite
- `eslint` - Linter
- `sass-embedded` - SCSS compiler

## 🎨 Features

- ✅ Modular architecture (feature-based)
- ✅ TypeScript for type safety
- ✅ Responsive design
- ✅ Print optimization (A4)
- ✅ Animations and transitions
- ✅ Centralized data in JSON

## 📝 License

Personal project
