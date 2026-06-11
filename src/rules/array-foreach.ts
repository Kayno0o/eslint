import type { Rule } from 'eslint'

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: { description: 'enforce `for..of` loops over `Array.forEach`' },
    schema: [],
    messages: { preferForOf: 'Prefer for...of instead of Array.forEach' },
  },
  create(context) {
    const sourceCode = context.sourceCode

    return {
      CallExpression(node) {
        if (node.callee.type !== 'MemberExpression' || node.callee.property.type !== 'Identifier' || node.callee.property.name !== 'forEach')
          return

        const callback = node.arguments[0]
        const isFixable = callback !== undefined
          && (callback.type === 'ArrowFunctionExpression' || callback.type === 'FunctionExpression')
          && callback.params.length === 1
          && callback.params[0].type === 'Identifier'

        context.report({
          node,
          messageId: 'preferForOf',
          fix: isFixable
            ? (fixer) => {
              const array = sourceCode.getText(node.callee.type === 'MemberExpression' ? node.callee.object : node.callee)
              const param = sourceCode.getText(callback.params[0])
              const bodyNode = callback.body
              const body = bodyNode.type === 'BlockStatement'
                ? sourceCode.getText(bodyNode)
                : `{ ${sourceCode.getText(bodyNode)} }`

              return fixer.replaceText(node, `for (const ${param} of ${array}) ${body}`)
            }
            : null,
        })
      },
    }
  },
}

export default rule
