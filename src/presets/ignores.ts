import type { TypedFlatConfigItem } from '../types'
import gitignore from 'eslint-config-flat-gitignore'

export function ignores(userIgnores: string[] = []): TypedFlatConfigItem[] {
  return [
    gitignore({ strict: false, name: 'kaynooo/gitignore' }),
    {
      name: 'kaynooo/ignores',
      ignores: [
        ...[
          '**/node_modules',
          '**/dist',
          '**/package-lock.json',
          '**/yarn.lock',
          '**/pnpm-lock.yaml',
          '**/bun.lockb',
          '**/output',
          '**/coverage',
          '**/temp',
          '**/.temp',
          '**/tmp',
          '**/.tmp',
          '**/.history',
          '**/.vitepress/cache',
          '**/.nuxt',
          '**/.next',
          '**/.svelte-kit',
          '**/.vercel',
          '**/.changeset',
          '**/.idea',
          '**/.cache',
          '**/.output',
          '**/.vite-inspect',
          '**/.yarn',
          '**/CHANGELOG*.md',
          '**/LICENSE*',
          '**/*.min.*',
          '**/__snapshots__',
          '**/vite.config.*.timestamp-*',
          '**/auto-import?(s).d.ts',
          '**/components.d.ts',
          '**/.context',
          '**/.claude',
          '**/.agents',
          '**/.*/skills',
          '**/*.md',
        ],
        ...userIgnores,
      ],
    },
  ]
}
