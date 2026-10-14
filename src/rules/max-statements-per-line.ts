import type { Rule } from 'eslint'

const LEADING_SPACE = /^(\s*)/

const LISTENING_NODES = [
  'BreakStatement',
  'ClassDeclaration',
  'ContinueStatement',
  'DebuggerStatement',
  'DoWhileStatement',
  'ExpressionStatement',
  'ForInStatement',
  'ForOfStatement',
  'ForStatement',
  'FunctionDeclaration',
  'IfStatement',
  'ImportDeclaration',
  'LabeledStatement',
  'ReturnStatement',
  'SwitchStatement',
  'ThrowStatement',
  'TryStatement',
  'VariableDeclaration',
  'WhileStatement',
  'WithStatement',
  'ExportNamedDeclaration',
  'ExportDefaultDeclaration',
  'ExportAllDeclaration',
] as const

type ListeningNode = typeof LISTENING_NODES[number]

// these nodes allow one un-braced child without counting it as a separate statement
// e.g. `if (x) foo()` = 1 statement, not 2
const SINGLE_CHILD_ALLOWED = /^(?:(?:DoWhile|For|ForIn|ForOf|If|Labeled|While)Statement|Export(?:Default|Named)Declaration)$/u

const rule: Rule.RuleModule = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: { description: 'enforce a maximum number of statements allowed per line' },
    schema: [{
      type: 'object',
      properties: {
        max: { type: 'integer', minimum: 1 },
        ignoredNodes: { type: 'array', items: { type: 'string', enum: [...LISTENING_NODES] } },
      },
      additionalProperties: false,
    }],
    messages: {
      exceed: 'This line has {{numberOfStatementsOnThisLine}} {{statements}}. Maximum allowed is {{maxStatementsPerLine}}.',
    },
  },
  create(context) {
    const { max = 1, ignoredNodes = [] } = (context.options[0] ?? {}) as { max?: number, ignoredNodes?: ListeningNode[] }
    const ignoredSet = new Set(ignoredNodes)
    const sourceCode = context.sourceCode
    let lastLine = 0
    let count = 0
    let firstExtra: Rule.Node | null = null

    function flush() {
      if (!firstExtra)
        return

      const node = firstExtra
      const indent = sourceCode.lines[node.loc!.start.line - 1].match(LEADING_SPACE)?.[1] ?? ''

      context.report({
        node,
        messageId: 'exceed',
        data: {
          numberOfStatementsOnThisLine: String(count),
          maxStatementsPerLine: String(max),
          statements: count === 1 ? 'statement' : 'statements',
        },
        fix(fixer) {
          const tokenBefore = sourceCode.getTokenBefore(node)

          if (!tokenBefore)
            return null

          if (tokenBefore.type === 'Keyword' && tokenBefore.value === 'else') {
            const beforeElse = sourceCode.getTokenBefore(tokenBefore)

            if (!beforeElse)
              return null

            const ifIndent = sourceCode.lines[(node.parent?.loc?.start.line ?? 1) - 1].match(LEADING_SPACE)?.[1] ?? ''

            return fixer.replaceTextRange([beforeElse.range[1], tokenBefore.range[0]], `\n${ifIndent}`)
          }

          return fixer.replaceTextRange([tokenBefore.range[1], node.range![0]], `\n${indent}`)
        },
      })
      firstExtra = null
    }

    function enter(node: Rule.Node) {
      let line = node.loc!.start.line
      const parent = node.parent

      if (parent && SINGLE_CHILD_ALLOWED.test(parent.type)) {
        // else-branches are NOT single-child-skipped
        const isElse = parent.type === 'IfStatement'
          && (parent as Rule.Node & { alternate: Rule.Node | null }).alternate === node

        if (!isElse)
          return

        // Count from the `else` keyword's line, not the alternate body's line
        const elseToken = sourceCode.getTokenBefore(node)

        if (elseToken)
          line = elseToken.loc.start.line
      }

      if (line === lastLine) {
        count += 1
      }
      else {
        flush()
        count = 1
        lastLine = line
      }

      if (count === max + 1)
        firstExtra ??= node
    }

    function leave(node: Rule.Node) {
      const lastToken = sourceCode.getLastToken(node, t => t.type !== 'Punctuator' || t.value !== ';')

      if (!lastToken)
        return

      const line = lastToken.loc.end.line

      if (line !== lastLine) {
        flush()
        count = 1
        lastLine = line
      }
    }

    const listener: Rule.RuleListener = { 'Program:exit': flush }

    for (const type of LISTENING_NODES) {
      if (ignoredSet.has(type))
        continue

      listener[type] = enter
      listener[`${type}:exit`] = leave
    }

    return listener
  },
}

export default rule
