# @kaynooo/eslint

## Usage

`eslint.config.ts`
```ts
import { defineConfig } from '@kaynooo/eslint'

export default defineConfig({ strict: true })
```

`package.json` - the `keslint` bin runs the ESLint this package depends on, so the app needs no `eslint` of its own:
```json
{
  "scripts": {
    "lint": "keslint --cache",
    "lint:fix": "keslint --fix --cache"
  }
}
```

## Astro

`defineConfig({ astro: true })` lints `.astro` files through `astro-eslint-parser`. With `strict: true`, `.astro` gets `project` and `tsconfigRootDir` directly rather than `projectService`, since `astro-eslint-parser` only emulates `project` from it, with a `console.warn`, and drops `tsconfigRootDir` doing so.

`astro-eslint-parser` also resolves `typescript` from the current working directory rather than from `tsconfigRootDir`, so lint from your project root. That part is upstream and not something this package works around.

## Svelte

`defineConfig({ svelte: true })` lints components through `svelte-eslint-parser`, with TypeScript in `<script lang="ts">`, and `.svelte.ts` / `.svelte.js` rune modules alongside them. It runs `eslint-plugin-svelte`'s recommended rules, gives component scripts the TypeScript rules, and swaps `prefer-const` for `svelte/prefer-const` in components, so `$props()` destructuring and `$derived` may stay `let`. Like `astro` and `solid`, it turns the Tailwind preset and CSS formatting on by default.

With `strict: true`, components get the type-aware rules too, so they need to be in your tsconfig.

## VSCode

`.vscode/settings.json`
```json
{
  // Enable the ESlint flat config support
  "eslint.useFlatConfig": true,

  // Disable the default formatter, use eslint instead
  "prettier.enable": false,
  "editor.formatOnSave": false,

  // Auto fix
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "always",
    "source.organizeImports": "never"
  },

  // Silent the stylistic rules in you IDE, but still auto fix them
  "eslint.rules.customizations": [
    { "rule": "style/*", "severity": "off" },
    { "rule": "format/*", "severity": "off" },
    { "rule": "*-indent", "severity": "off" },
    { "rule": "*-spacing", "severity": "off" },
    { "rule": "*-spaces", "severity": "off" },
    { "rule": "*-order", "severity": "off" },
    { "rule": "*-dangle", "severity": "off" },
    { "rule": "*-newline", "severity": "off" },
    { "rule": "*quotes", "severity": "off" },
    { "rule": "*semi", "severity": "off" }
  ],

  // Enable eslint for all supported languages
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "html",
    "markdown",
    "json",
    "jsonc",
    "yaml",
    "toml",
    "css",
    "tailwindcss",
    "xml",
    "gql",
    "graphql",
    "astro",
    "svelte",
    "less",
    "scss",
    "pcss",
    "postcss",
    "github-actions-workflow"
  ]
}
```
