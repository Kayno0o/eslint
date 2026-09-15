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

- they have no oxlint equivalent - every `style/*`, `regexp/*`, `perfectionist/*`, `solid/*`, `svelte/*`, `better-tailwindcss/*`, `e18e/*`, `antfu/*`, `eslint-comments/*`, `unused-imports/*` and `kaynooo/*` rule, plus everything for JSON, YAML, TOML, Markdown and CSS, which oxlint does not read
- we enable them for JS but not TS, like `no-unused-vars` - oxlint has no such split, and `no-undef` would need our globals translated with it
- **you configured them yourself**, anywhere in your config - your scoping and options are not ours to translate, so the rule keeps running under ESLint alone

A rule we scope to a file family is handed over scoped: the `jsx-a11y/*` rules go into an oxlint `overrides` block for `**/*.jsx` and `**/*.tsx`, and are turned off in ESLint for those files only. The `astro/jsx-a11y/*` rules stay in ESLint, since oxlint reads `<script>` blocks in `.astro` but not the template.

Markdown code blocks keep the full ESLint ruleset, since oxlint does not read `.md`.

### Type-aware rules

With `strict: true` the type-aware rules go to oxlint too, which runs them through [`oxlint-tsgolint`](https://github.com/oxc-project/tsgolint). They move as a block: ESLint only stops building a TypeScript program once every one of them is handed over, so one rule left behind - because you configured it yourself, say - keeps the program and the cost that comes with it. When that happens nothing breaks, the rules just stay where they were.

`oxlint-tsgolint` reads neither `.astro` nor `.svelte`, so under the handover components get none of the type-aware rules and keep the core rules those replace, such as `dot-notation` and `no-implied-eval`. `oxlint: false` adds them to `filesTypeAware` and type-checks them in ESLint.

Dropping the program is the whole point. On this repo, 56 files:

| | |
| --- | --- |
| ESLint alone, type-aware rules included | 4584 ms |
| ESLint with the program dropped | 1661 ms |
| oxlint `--type-aware` doing them instead | 190 ms |
| `kaynooo` end to end | **1838 ms** |

`oxlint-tsgolint` ships a ~22 MB platform binary and is a hard dependency, so the ESLint config and the linter that runs it can never disagree about who owns a rule. Projects that never set `strict: true` still pay for the download.

### Why not oxlint's own categories

The generated config sets `categories: { correctness: 'off' }` and lists every rule explicitly. Letting oxlint's default category through would re-enable rules our presets deliberately turn off, and pull in ones that misread our stack - `no-unassigned-vars` flags every SolidJS `ref` binding, `jsdoc/check-tag-names` flags custom tags. Rules that earn their place get enabled in the presets and reach oxlint through the ledger, so ESLint and your editor agree on the ruleset.

### Why not `eslint-plugin-oxlint`

It turns off rules by their upstream names, and our presets alias the plugins (`ts/*` rather than `@typescript-eslint/*`, `eslint-plugin-import-lite` under `import/*`), so its disables miss. It also expects you to maintain `.oxlintrc.json` and mirror it into ESLint, which is the opposite of what we want: here the ESLint config is the single source and the oxlint config is generated from it.

Set `oxlint: false` to keep everything in ESLint. The bin then only runs ESLint, so `eslint` in your scripts keeps working too.

### Editor

The ESLint extension only reports what ESLint still owns. To see the rest inline, install the [oxc extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) and point it at the generated config (it is written on the first `kaynooo` run):

```json
{
  "oxc.configPath": "node_modules/.cache/kaynooo/oxlintrc.json"
}
```

## Svelte

`defineConfig({ svelte: true })` lints components through `svelte-eslint-parser`, with TypeScript in `<script lang="ts">`, and `.svelte.ts` / `.svelte.js` rune modules alongside them. It runs `eslint-plugin-svelte`'s recommended rules, gives component scripts the TypeScript rules, and swaps `prefer-const` for `svelte/prefer-const` in components, so `$props()` destructuring and `$derived` may stay `let`. Like `astro` and `solid`, it turns the Tailwind preset and CSS formatting on by default.

oxlint reads a component's `<script>` blocks but not its markup, so it is kept off four ledger rules for `**/*.svelte`, whose parser sees both:

- `ts/consistent-type-imports`, which oxlint silently skips in a component, so ESLint reports it there instead
- `no-labels`, which oxlint would report on every legacy `$:` statement, where ESLint's parser sees a reactive statement
- `no-self-assign`, which the Svelte plugin turns off in components and oxlint would still report
- `prefer-const`, which `svelte/prefer-const` replaces in components: oxlint skips it there today, and the entry keeps a later oxlint from reporting the `let` a component's markup reassigns

The rest of the ledger goes to oxlint for components too, and rune modules are plain TypeScript to it. The list is `PARTIALS` in [`src/oxlint/ledger.ts`](src/oxlint/ledger.ts).

With `strict: true` and the handover on, components get no type-aware rules at all, since `oxlint-tsgolint` does not read them: the handed-over rules reach rune modules only, and components keep the core `dot-notation` and `no-implied-eval`. `oxlint: false` is what type-checks components: it adds `.svelte` to `filesTypeAware`, which gives them `ts/no-floating-promises`, `svelte/no-unused-props` and the rest of the type-aware rules, at the cost of the TypeScript program.

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
