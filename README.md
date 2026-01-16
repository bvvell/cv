# CV - Uladzimir Biarnatski

Modern CV website built with **Vue 3**, **TypeScript**, **Vue Router**, and **Vite**.

## 🚀 Quick Start

### Install dependencies
```bash
npm install
```

### Run dev server
```bash
npm run dev
```
Opens at `http://localhost:5173`

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
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

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run lint:fix` - Auto-fix linting errors

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
