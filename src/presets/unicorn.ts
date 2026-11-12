import type { ESLint, Rule, SourceCode } from 'eslint'
import type { Node, Statement } from 'estree'
import type { TypedFlatConfigItem } from '../types'
import { interopDefault, libVersion } from '../plugins'
import { MAX_LINE } from '../rules/prefer-ternary-return'

const rangeOf = (target: { range?: [number, number] }): [number, number] => target.range ?? [0, 0]

// Records the edits a fix asks for instead of applying them.
const recorder: Rule.RuleFixer = {
  insertTextAfter: (target, text) => ({ range: [rangeOf(target)[1], rangeOf(target)[1]], text }),
  insertTextAfterRange: (range, text) => ({ range: [range[1], range[1]], text }),
  insertTextBefore: (target, text) => ({ range: [rangeOf(target)[0], rangeOf(target)[0]], text }),
  insertTextBeforeRange: (range, text) => ({ range: [range[0], range[0]], text }),
  remove: target => ({ range: rangeOf(target), text: '' }),
  removeRange: range => ({ range, text: '' }),
  replaceText: (target, text) => ({ range: rangeOf(target), text }),
  replaceTextRange: (range, text) => ({ range, text }),
}

/** The widest line the report's fix, or its first suggestion, would leave around what it changes; 0 when it offers neither. */
function fixedLineWidth(text: string, descriptor: Rule.ReportDescriptor): number {
  const result = (descriptor.fix ?? descriptor.suggest?.[0]?.fix)?.(recorder)

  if (result == null)
    return 0

  const edits = ('range' in result ? [result] : [...result]).toSorted((a, b) => a.range[0] - b.range[0])
  const first = edits[0]

  if (first == null)
    return 0

  let fixed = ''
  let cursor = 0

  for (const edit of edits) {
    fixed += text.slice(cursor, edit.range[0]) + edit.text
    cursor = edit.range[1]
  }

  const editedEnd = fixed.length

  fixed += text.slice(cursor)

  const lineEnd = fixed.indexOf('\n', editedEnd)
  const region = fixed.slice(text.lastIndexOf('\n', first.range[0] - 1) + 1, lineEnd === -1 ? fixed.length : lineEnd)

  return Math.max(...region.split('\n').map(line => line.length))
}

function isEarlyReturn(node: Node): boolean {
  if (node.type !== 'IfStatement' || node.alternate != null)
    return false

  const { consequent } = node

  return consequent.type === 'ReturnStatement' || (consequent.type === 'BlockStatement' && consequent.body.length === 1 && consequent.body[0]?.type === 'ReturnStatement')
}

const branchBody = (branch: Statement): Statement => branch.type === 'BlockStatement' && branch.body.length === 1 ? branch.body[0] : branch

/** For a report with no fix to dry-run: the width of the one-line ternary keeping once what both branches share at their start and end. */
function mergedWidth(sourceCode: SourceCode, node: Node): number {
  if (node.type !== 'IfStatement' || node.alternate == null)
    return 0

  const a = sourceCode.getText(branchBody(node.consequent))
  const b = sourceCode.getText(branchBody(node.alternate))
  let start = 0
  let end = 0

  while (start < a.length && start < b.length && a[start] === b[start])
    start++

  while (end < a.length - start && end < b.length - start && a[a.length - 1 - end] === b[b.length - 1 - end])
    end++

  return node.loc!.start.column + start + sourceCode.getText(node.test).length + ' ? '.length + (a.length - start - end) + ' : '.length + (b.length - start - end) + end
}

// Since unicorn 79, prefer-ternary also reports `if (c) return a` followed by `return b`, which kaynooo/prefer-ternary-return covers, and merges an if/else into one call however long the result: drop those reports and the ones whose ternary would pass MAX_LINE.
function withoutEarlyReturns(plugin: ESLint.Plugin): ESLint.Plugin {
  const rule = plugin.rules?.['prefer-ternary']

  if (rule == null)
    return plugin

  const create = (context: Rule.RuleContext) => {
    const report = (descriptor: Rule.ReportDescriptor) => {
      if ('node' in descriptor && isEarlyReturn(descriptor.node as Node))
        return

      const fixed = fixedLineWidth(context.sourceCode.text, descriptor)
      const width = fixed > 0 || !('node' in descriptor) ? fixed : mergedWidth(context.sourceCode, descriptor.node as Node)

      if (width <= MAX_LINE)
        context.report(descriptor)
    }

    return rule.create(Object.create(context, { report: { value: report } }) as Rule.RuleContext)
  }

  const meta = { ...plugin.meta, version: `${plugin.meta?.version ?? '0.0.0'}+kaynooo.${libVersion}` }

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
