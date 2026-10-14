// Ambient declarations for ESLint plugins that ship without types.
declare module 'eslint-plugin-no-only-tests' {
  import type { ESLint } from 'eslint'

  const plugin: ESLint.Plugin

  export default plugin
}

declare module '@e18e/eslint-plugin'
declare module '@eslint-community/eslint-plugin-eslint-comments'
declare module 'eslint-plugin-command'
