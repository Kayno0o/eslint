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

`--concurrency 2` speeds up a project without `strict` (kayjs: 20.6s down to 17.4s). Under `strict`, leave it off: each thread builds its own TypeScript program, so on kayjs two threads doubled the CPU time and added 1.4 GB without finishing sooner.

## Kay

`defineConfig({ kay: true })` lints the script and server fences of kay's `.kay` components, through the `kay/eslint` processor of the app's own `kay`: it lints the TSX `kay check` type-checks a component as, and reports only what falls in a fence's own code, at its `.kay` line, fixes included. The rules the generated code around a fence would trip are off there: blank lines and padding, import order and adjacency, and with a kay before 1.70 `style/indent`.

With `strict: true`, fences get the type-aware rules through the shadow files `kay check`, `kay dev` or kay's language server write under `.kay/types`, so run one of them before linting, as CI runs `kay check` first.

## Tailwind

`defineConfig({ tailwind: true })` lints Tailwind classes through `eslint-plugin-better-tailwindcss`, against kay's `src/app.css` unless `tailwind: { entryPoint }` names another. It is off by default: kay drops what it reports in `.kay` templates, so on a kay site it only reaches classes in `.ts` files.

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
    "kay",
    "less",
    "scss",
    "pcss",
    "postcss",
    "github-actions-workflow"
  ]
}
```
