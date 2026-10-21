import type { TypedFlatConfigItem } from '../types'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { interopDefault } from '../plugins'

// The blocks kay's processor hands ESLint: a component's TSX, named after the `.kay` file it came from.
export const GLOB_KAY_BLOCK = ['**/*.kay/*.tsx']

interface KayEslint {
  processor: NonNullable<TypedFlatConfigItem['processor']> & { meta?: { version?: string } }
  shadowParser: <Parser>(parser: Parser) => NonNullable<NonNullable<TypedFlatConfigItem['languageOptions']>['parser']>
}

function resolveKay(): string {
  try {
    return createRequire(join(process.cwd(), 'package.json')).resolve('kay/eslint')
  }
  catch {
    throw new Error(`kay: true lints .kay files through the app's own kay, which ${process.cwd()} lacks: depend on kay 0.14 or later under the name kay, and lint from the project root`)
  }
}

// kay 1.70 reads a fence's lines at the indentation the generated code gives them, and judges nothing else with the indentation rule; an older kay would have every line reported.
function readsIndentation(version: string | undefined): boolean {
  const [major = 0, minor = 0] = (version ?? '').split('.').map(Number)

  return major > 1 || (major === 1 && minor >= 70)
}

export async function kay(): Promise<TypedFlatConfigItem[]> {
  // From the app rather than this package, which does not depend on kay: the app's own `kay` compiles its components.
  const entry = resolveKay()
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
      // A fence's code, and a template expression, sit inside generated code, and a component has no module scope to move a regex to: a slot's params and a loop's callbacks are wrapped in parentheses the template never wrote; a server fence in the `load` function, imports of both fences hoisted together beside kay's own; a handler stays on the one line of its attribute list; a prop with a default is read as a ternary, which nests the template's own.
      name: 'kaynooo/kay/rules',
      files: GLOB_KAY_BLOCK,
      rules: {
        'antfu/if-newline': 'off',
        'e18e/prefer-static-regex': 'off',
        'import/first': 'off',
        'import/newline-after-import': 'off',
        'import/no-duplicates': 'off',
        'kaynooo/max-statements-per-line': 'off',
        'no-nested-ternary': 'off',
        'perfectionist/sort-imports': 'off',
        'style/arrow-parens': 'off',
        ...readsIndentation(processor.meta?.version) ? {} : { 'style/indent': 'off' },
        'style/no-multiple-empty-lines': 'off',
        'style/padding-line-between-statements': 'off',
      },
    },
  ]
}
