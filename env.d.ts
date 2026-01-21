/// <reference types="vite/client" />

// Vite + TS helpers so `.vue` and `.md` files are typed imports.
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Markdown posts compile to Vue SFCs (via `unplugin-vue-markdown`) and expose `frontmatter`.
declare module '*.md' {
  import type { DefineComponent } from 'vue'
  export const frontmatter: Record<string, any>
  const component: DefineComponent<{}, {}, any>
  export default component
}
