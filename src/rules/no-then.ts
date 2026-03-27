import type { Rule } from 'eslint'

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'enforce using `async/await` syntax over Promises' },
    schema: [],
    messages: { preferAsyncAwait: 'Prefer async/await to Promise.{{method}}()' },
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (node.property.type === 'Identifier' && (node.property.name === 'then' || node.property.name === 'catch')) {
          context.report({ node: node.property, messageId: 'preferAsyncAwait', data: { method: node.property.name } })
        }
      },
    }
  },
}

export default rule
