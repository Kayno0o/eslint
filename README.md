# @kaynooo/eslint

## Usage

`eslint.config.ts`
```ts
import { defineConfig } from '@kaynooo/eslint'

export default defineConfig({ strict: true })
```

`package.json` - run the `kaynooo` bin instead of `eslint`, it drives both linters:
```json
{
  "scripts": {
    "lint": "kaynooo --cache",
    "lint:fix": "kaynooo --fix --cache"
  }
}
```

## oxlint

Part of the ruleset has moved to [oxlint](https://oxc.rs). The `kaynooo` bin runs oxlint first, then ESLint, and exits non-zero if either did - both always run, so one pass shows every problem. `--fix`, `--quiet` and `--max-warnings` go to both, everything else is ESLint's.

The handover is derived from your resolved ESLint config, not from a config you maintain: the rules in [`src/oxlint/ledger.ts`](src/oxlint/ledger.ts) are turned off in ESLint and written to `node_modules/.cache/kaynooo/oxlintrc.json`, with the options ESLint resolved for them. Rules stay in ESLint when:

- they have no oxlint equivalent - every `style/*`, `regexp/*`, `perfectionist/*`, `solid/*`, `better-tailwindcss/*`, `e18e/*`, `antfu/*` and `kaynooo/*` rule, plus everything for JSON, YAML, TOML, Markdown and CSS, which oxlint does not read
- they need type information - oxlint does them through `oxlint-tsgolint`, which is not wired up yet
- **you configured them yourself**, anywhere in your config - your scoping and options are not ours to translate, so the rule keeps running under ESLint alone

Markdown code blocks keep the full ESLint ruleset, since oxlint does not read `.md`.

Set `oxlint: false` to keep everything in ESLint. The bin then only runs ESLint, so `eslint` in your scripts keeps working too.

### Editor

The ESLint extension only reports what ESLint still owns. To see the rest inline, install the [oxc extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) and point it at the generated config (it is written on the first `kaynooo` run):

```json
{
  "oxc.configPath": "node_modules/.cache/kaynooo/oxlintrc.json"
}
```

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
    "less",
    "scss",
    "pcss",
    "postcss",
    "github-actions-workflow"
  ]
}
```
