/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.md' {
  import type { DefineComponent } from 'vue'
  export const frontmatter: Record<string, any>
  const component: DefineComponent<{}, {}, any>
  export default component
}
