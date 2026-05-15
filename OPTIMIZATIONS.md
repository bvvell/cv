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
- `app`: 7.55 KB
- `vue`: 24.59 KB (rarely changes)
- `router`: 10.03 KB (rarely changes)
- `vendor`: 6.62 KB (rest of node_modules)
- `homePage`: 0.97 KB (lazy)
- `cvPage`: 2.09 KB (lazy)
- `postsIndexPage`: 1.33 KB (lazy)
- `postsPostPage`: 9.57 KB (lazy, includes markdown components)

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

### Improvements:
- ✅ Faster initial page load
- ✅ Better code splitting
- ✅ Improved caching strategy
- ✅ Type safety improvements
- ✅ Better maintainability

## 🚀 Future Optimization Opportunities

1. **Responsive images**
   - Add `srcset` / `sizes` for content images (sharp can emit multiple widths).

2. **Service Worker / PWA**
   - `vite-plugin-pwa` for offline precache; manifest already in place.

3. **Performance monitoring**
   - Hook Core Web Vitals into the existing Umami analytics.

4. **CSS strategy**
   - Re-evaluate `cssCodeSplit: false` against per-route split now that critical CSS
     is already inlined and the rest is preloaded.
