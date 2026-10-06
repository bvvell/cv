# Project Optimizations

This document describes all optimizations applied to the CV project.

## ✅ Completed Optimizations

### 1. **Code Splitting & Lazy Loading Routes**
- **Before**: All components loaded immediately
- **After**: Routes use dynamic imports (`() => import(...)`), HomePage included
- **Benefit**:
  - Initial bundle reduced
  - Pages load on-demand
  - Vendor split by library family (vue / router / vendor) for better long-term caching

**Result (gzip)**:
- `app`: 14.60 KB
- `vue`: 25.55 KB (rarely changes)
- `router`: 10.03 KB (rarely changes)
- `vendor`: 6.63 KB (rest of node_modules)
- `homePage`: 2.32 KB (lazy)
- `cvPage`: 2.05 KB (lazy)
- `postsIndexPage`: 1.29 KB (lazy)
- `postsPostPage`: 51.67 KB (lazy, includes all posts + Shiki)

### 2. **Improved TypeScript Types**
- **Before**: Used `@ts-expect-error` for router meta
- **After**: Proper type declaration for `RouteMeta`
- **Benefit**: Type safety, better IDE support, no type errors

### 3. **Vite Build Optimizations**
- **Added**: Manual chunk splitting for vendor code
- **Added**: Chunk size warning limit
- **Benefit**: Better caching, smaller initial load

### 4. **Image Optimization**
- **Added**: `decoding="async"` for all post images.
- **Added**: Preload for critical avatar image (`index.html`).
- **Updated**: Above-the-fold avatar uses `loading="eager"` + `fetchpriority="high"`.
- **Added**: `scripts/optimize-images.mjs` (sharp) — idempotent step in `dev`/`build` that
  generates `.webp` siblings for `.jpg`/`.png` and a `.jpg` fallback from PNG photos.
- **Added**: `markdownItSetup` auto-wraps `<img>` into `<picture>` with a `.webp` source
  when one exists on disk. Authors who pre-wrote `<picture>` blocks are not double-wrapped.
- **Result** (post images):
  - `seryja-kazhny-dzen-2026`: 567 KB PNG → 31 KB JPG + 16 KB WebP.
  - `daroga-25`: 503 KB JPG → 203 KB JPG + 130 KB WebP (orphan 2.6 MB PNG dropped).
  - `veloviewer`: 485 KB PNG kept (infographic, sharpness) + 74 KB WebP.
  - All `kalendar-zhyccia*` assets now have WebP siblings.
- **Benefit**: Lower LCP on post pages without authoring overhead.

### 5. **Data Management Optimization**
- **Added**: `readonly()` wrapper for CV data
- **Benefit**: Prevents accidental mutations, better performance

### 6. **Code Reusability**
- **Created**: `usePageLoader` composable
- **Benefit**: Removed code duplication, easier maintenance

### 7. **SEO / `<head>` Centralization**
- **Created**: `useSiteHead` composable (moved logic out of `App.vue`).
- **Adds**: `Person`, `WebSite`, `ProfilePage`, `BlogPosting`, `BreadcrumbList` JSON-LD.
- **Benefit**: Cleaner root component, single place for canonical/OG/Twitter/JSON-LD + language switching for posts.

### 8. **RSS Feed**
- **Added**: `scripts/generate-feed.mjs` produces `dist/feed.xml` from `posts-index.json`.
- **Added**: `<link rel="alternate" type="application/rss+xml">` in `index.html`.
- **Benefit**: Subscribers can follow new posts; no runtime cost.

### 9. **Syntax Highlighting (Shiki)**
- **Added**: `@shikijs/markdown-it` with dual themes (`github-light` / `github-dark-dimmed`).
- **Renderer**: Build-time only; emits CSS variables so the page swaps palette under
  `prefers-color-scheme: dark` via stylesheet rules in `postsPostPage.styles.scss`.
- **Benefit**: Zero runtime JS for syntax highlighting.

### 10. **CI: Playwright Browser Cache**
- **Added**: `actions/cache@v4` for `~/.cache/ms-playwright`, keyed on resolved Playwright version.
- **Benefit**: Skips Chromium re-download on warm runs; still installs apt deps on cache hit.

### 11. **Image Budget**
- Replaced the multi-megabyte RGBA PNG photos (the `kamni-200` post shipped ~32 MB of
  PNGs) with resized JPEGs, regenerated their WebP siblings, and removed orphan images
  (including `.jpg` copies the old pipeline generated but nothing referenced).
- `optimize-images.mjs` now resizes WebP to a 1600 px max width and no longer emits
  `.jpg` orphans.
- **Result**: `public/images` 61 MB → ~19 MB.

### 12. **Life Calendar SSR Bloat**
- The "life in weeks" widget used to prerender `52 × N years` cells — thousands of DOM
  nodes and ~300 KB of HTML per locale. It now defaults to an empty birth date (the
  correct "enter YOUR date" behaviour) and renders the grid only once the reader inputs
  a valid date.
- **Result**: the `kalendar-zhyccia` page HTML went from 313 KB → ~18 KB per locale.

### 13. **Type Checking + Tests**
- Added `vue-tsc` (`pnpm typecheck`) and Vitest (`pnpm test`), both wired into CI.
- `vue-tsc` immediately caught a latent bug: `pathToRegexpOptions` is ignored by
  vue-router 4.6 (the option is now top-level `strict`), so the trailing-slash
  strictness was silently dropped.
- Added 37 unit tests covering URL normalization, date formatting, locale detection,
  storage, the analytics queue, and the life-calendar math.

### 14. **Version Bump on Every Push**
- CI now runs a `release` job on each push to `main` that bumps the patch version
  (standard-version), tags it, and the deploy job stamps the bumped version into
  `dist/version.json` via `APP_VERSION`.

### 15. **Housekeeping**
- Deduplicated `.env` parsing into `scripts/lib/site-env.mjs`.
- Removed dead HTML (`meta keywords`, `X-UA-Compatible`) and added real PWA manifest
  icons (192/512 px).

### Improvements:
- ✅ Faster initial page load
- ✅ Better code splitting
- ✅ Improved caching strategy
- ✅ Type safety improvements (incl. `vue-tsc`)
- ✅ Automated tests (Vitest)
- ✅ Smaller images and prerendered HTML
- ✅ Better maintainability

## 🚀 Future Optimization Opportunities

1. **Responsive images**
   - Add `srcset` / `sizes` for content images (sharp can emit multiple widths).

2. **Service Worker / PWA**
   - `vite-plugin-pwa` for offline precache; the manifest now has real 192/512 icons.

3. **Performance monitoring**
   - Hook Core Web Vitals into the existing Umami analytics (the tracker already
     collects them via `data-performance`).

4. **CSS strategy**
   - Re-evaluate `cssCodeSplit: false` against per-route split now that critical CSS
     is already inlined and the rest is preloaded.

5. **Per-post code splitting**
   - `postsPostPage` still bundles every post plus Shiki (51.67 KB gzip); split it so
     each post lazy-loads its own markdown.
