import type { Rule } from 'eslint'

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'enforce `for..of` loops over `Array.forEach`' },
    schema: [],
    messages: { preferForOf: 'Prefer for...of instead of Array.forEach' },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type === 'MemberExpression' && node.callee.property.type === 'Identifier' && node.callee.property.name === 'forEach')
          context.report({ node, messageId: 'preferForOf' })
      },
    }
  },
}

export default rule
