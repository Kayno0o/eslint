import type { TypedFlatConfigItem } from '../types'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { interopDefault } from '../plugins'

// The blocks kay's processor hands ESLint: a component's TSX, named after the `.kay` file it came from.
export const GLOB_KAY_BLOCK = ['**/*.kay/*.tsx']

interface KayEslint {
  processor: NonNullable<TypedFlatConfigItem['processor']>
  shadowParser: <Parser>(parser: Parser) => NonNullable<NonNullable<TypedFlatConfigItem['languageOptions']>['parser']>
}

export async function kay(): Promise<TypedFlatConfigItem[]> {
  // From the app rather than this package, which does not depend on kay: the app's own `kay` compiles its components.
  const entry = createRequire(join(process.cwd(), 'package.json')).resolve('kay/eslint')
  const [{ processor, shadowParser }, parserTs] = await Promise.all([
    import(pathToFileURL(entry).href) as Promise<KayEslint>,
    interopDefault(import('@typescript-eslint/parser')),
  ])

  return [
    {
      name: 'kaynooo/kay/ignores',
      ignores: ['**/.kay'],
    },
    {
      name: 'kaynooo/kay/processor',
      files: ['**/*.kay'],
      processor,
    },
    {
      name: 'kaynooo/kay/parser',
      files: GLOB_KAY_BLOCK,
      languageOptions: { parser: shadowParser(parserTs) },
    },
    {
      // A fence's code sits inside generated code: a server fence in the `load` function, imports of both fences hoisted together beside kay's own.
      name: 'kaynooo/kay/rules',
      files: GLOB_KAY_BLOCK,
      rules: {
        'import/first': 'off',
        'import/newline-after-import': 'off',
        'import/no-duplicates': 'off',
        'perfectionist/sort-imports': 'off',
        'style/indent': 'off',
        'style/no-multiple-empty-lines': 'off',
        'style/padding-line-between-statements': 'off',
      },
    },
  ]
}
