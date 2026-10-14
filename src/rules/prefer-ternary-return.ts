import type { Rule } from 'eslint'
import type { Expression, ReturnStatement, Statement } from 'estree'

const MAX_LINE = 120

// Operands a ternary would need parentheses around, or that would nest one ternary in another.
const UNSAFE_OPERANDS = new Set(['ArrowFunctionExpression', 'AssignmentExpression', 'ConditionalExpression', 'SequenceExpression', 'YieldExpression'])

function soleReturn(statement: Statement): (ReturnStatement & { argument: Expression }) | undefined {
  const inner = statement.type === 'BlockStatement' && statement.body.length === 1 ? statement.body[0] : statement

  return inner?.type === 'ReturnStatement' && inner.argument != null ? inner as ReturnStatement & { argument: Expression } : undefined
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: { description: 'enforce a ternary for a two-way return over an `if` returning early' },
    schema: [],
    messages: { preferTernary: 'Return a ternary instead of returning early then returning the other value' },
  },
  create(context) {
    const sourceCode = context.sourceCode

    return {
      IfStatement(node) {
        if (node.alternate != null)
          return

        const early = soleReturn(node.consequent)
        const siblings = node.parent.type === 'BlockStatement' || node.parent.type === 'Program' ? node.parent.body as Statement[] : undefined
        const next = siblings?.[siblings.indexOf(node) + 1]

        if (early === undefined || next?.type !== 'ReturnStatement' || next.argument == null)
          return

        const operands = [node.test, early.argument, next.argument]

        if (operands.some(operand => UNSAFE_OPERANDS.has(operand.type)))
          return

        // `c ? true : x` reads worse than the early return, and better as `c || x`, which only a type-aware rule could offer safely.
        if ([early.argument, next.argument].some(operand => operand.type === 'Literal' && typeof operand.value === 'boolean'))
          return

        const texts = operands.map(operand => sourceCode.getText(operand))

        if (texts.some(text => text.includes('\n')) || sourceCode.getCommentsInside(node).length > 0 || sourceCode.getCommentsBefore(next).length > 0)
          return

        const [test, consequent, alternate] = texts
        const replacement = `return ${test} ? ${consequent} : ${alternate}`

        if (node.loc!.start.column + replacement.length > MAX_LINE)
          return

        context.report({
          node,
          messageId: 'preferTernary',
          fix: fixer => fixer.replaceTextRange([node.range![0], next.range![1]], replacement),
        })
      },
    }
  },
}

export default rule
