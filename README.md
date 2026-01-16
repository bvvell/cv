# CV - Uladzimir Biarnatski

Modern CV website built with **Vue 3**, **TypeScript**, **Vue Router**, and **Vite**.

## ✅ Requirements

- **Node.js**: `>=20 <22` (SSG build relies on this range)
- Package manager: `pnpm` recommended (lockfile is `pnpm-lock.yaml`)

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
    ├── style.css                 # Global styles
    │
    ├── home/                     # Home page module
    │   ├── pages/
    │   │   └── homePage/         # Home page
    │
    ├── cv/                       # CV page module
    │   ├── pages/
    │   │   └── cvPage/           # CV page
    │   └── components/           # CV components
    │       ├── cvHeader/
    │       ├── cvSummary/
    │       ├── cvSkills/
    │       ├── cvEducation/
    │       ├── cvExperience/
    │       └── cvFooter/
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
- **CV** (`/cv`) - Full CV with work experience, skills, education

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
- `pnpm build` - Static build (SSG) to `dist/`
- `pnpm preview` - Preview production build
- `pnpm lint` - Lint code
- `pnpm lint:fix` - Auto-fix linting errors

## 🧠 SEO / `<head>`

- `<title>`, Open Graph, and Twitter meta are managed via `@unhead/vue` in `src/App.vue`.
- Per-route `title` / `description` live in `src/router/index.ts` (`route.meta`).
- Set `VITE_SITE_URL` to generate absolute `og:url`, `og:image` and canonical URLs during SSG.
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
