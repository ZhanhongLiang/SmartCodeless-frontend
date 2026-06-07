// /// <reference types="vite/client" />

// declare module '*.vue' {
//   import type { DefineComponent } from 'vue'
//   const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
//   export default component
// }

declare module 'markdown-it' {
  export default class MarkdownIt {
    constructor(options?: Record<string, unknown>)
    render(src: string): string
    utils: {
      escapeHtml(src: string): string
    }
  }
}
