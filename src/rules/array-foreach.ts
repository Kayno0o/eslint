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

        if (callback === undefined || (callback.type !== 'ArrowFunctionExpression' && callback.type !== 'FunctionExpression'))
          return context.report({ node, messageId: 'preferForOf' })

        const params = callback.params
        const oneParam = params.length === 1 && params[0].type === 'Identifier'
        const twoParams = params.length === 2 && params[0].type === 'Identifier' && params[1].type === 'Identifier'

        context.report({
          node,
          messageId: 'preferForOf',
          fix: (oneParam || twoParams)
            ? (fixer) => {
              const array = sourceCode.getText(node.callee.type === 'MemberExpression' ? node.callee.object : node.callee)
              const param = sourceCode.getText(params[0])
              const bodyNode = callback.body
              const body = bodyNode.type === 'BlockStatement'
                ? sourceCode.getText(bodyNode)
                : `{ ${sourceCode.getText(bodyNode)} }`

              if (twoParams) {
                const indexParam = sourceCode.getText(params[1])

                return fixer.replaceText(node, `for (const [${indexParam}, ${param}] of ${array}.entries()) ${body}`)
              }

              return fixer.replaceText(node, `for (const ${param} of ${array}) ${body}`)
            }
            : null,
        })
      },
    }
  },
}

export default rule
