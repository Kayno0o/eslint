import type { ESLint, Rule } from 'eslint'
import type { Node } from 'estree'
import type { TypedFlatConfigItem } from '../types'
import { interopDefault } from '../plugins'

function isEarlyReturn(node: Node): boolean {
  if (node.type !== 'IfStatement' || node.alternate != null)
    return false

  const { consequent } = node

  return consequent.type === 'ReturnStatement' || (consequent.type === 'BlockStatement' && consequent.body.length === 1 && consequent.body[0]?.type === 'ReturnStatement')
}

// Since unicorn 79, prefer-ternary also reports `if (c) return a` followed by `return b`, which kaynooo/prefer-ternary-return covers within 120 columns: drop those reports, keep the others.
function withoutEarlyReturns(plugin: ESLint.Plugin): ESLint.Plugin {
  const rule = plugin.rules?.['prefer-ternary']

  if (rule == null)
    return plugin

  const create = (context: Rule.RuleContext) => {
    const report = (descriptor: Rule.ReportDescriptor) => {
      if (!('node' in descriptor) || !isEarlyReturn(descriptor.node as Node))
        context.report(descriptor)
    }

    return rule.create(Object.create(context, { report: { value: report } }) as Rule.RuleContext)
  }

  // A version of its own, as ESLint's --cache keys results on the plugins' name and version and would keep the dropped reports.
  const meta = { ...plugin.meta, version: `${plugin.meta?.version ?? '0.0.0'}+kaynooo-ternary` }

  return { ...plugin, meta, rules: { ...plugin.rules, 'prefer-ternary': { ...rule, create } } }
}

export async function unicorn(): Promise<TypedFlatConfigItem[]> {
  const pluginUnicorn = await interopDefault(import('eslint-plugin-unicorn'))

  return [
    {
      name: 'kaynooo/unicorn/setup',
      plugins: {
        unicorn: withoutEarlyReturns(pluginUnicorn),
      },
    },
    {
      name: 'kaynooo/unicorn/rules',
      files: [
        '**/*.?([cm])[jt]s?(x)',
      ],
      rules: {
        'unicorn/consistent-empty-array-spread': 'error',
        'unicorn/error-message': 'error',
        'unicorn/escape-case': 'error',
        'unicorn/new-for-builtins': 'error',
        'unicorn/no-instanceof-builtins': 'error',
        'unicorn/no-new-buffer': 'error',
        'unicorn/no-unsafe-sqlite-interpolation': 'error',
        'unicorn/no-useless-fallback-in-spread': 'error',
        'unicorn/no-useless-length-check': 'error',
        'unicorn/no-useless-spread': 'error',
        'unicorn/number-literal-case': 'error',
        'unicorn/prefer-dom-node-text-content': 'error',
        'unicorn/prefer-includes': 'error',
        'unicorn/prefer-node-protocol': 'error',
        'unicorn/prefer-number-properties': 'error',
        'unicorn/prefer-set-has': 'error',
        'unicorn/prefer-string-starts-ends-with': 'error',
        'unicorn/prefer-ternary': ['error', 'only-single-line'],
        'unicorn/prefer-type-error': 'error',
        'unicorn/throw-new-error': 'error',
      },
    },
  ]
}
