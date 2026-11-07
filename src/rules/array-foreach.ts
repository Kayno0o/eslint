import type { Rule, SourceCode } from 'eslint'
import type { ArrowFunctionExpression, FunctionExpression, Node } from 'estree'

// Whether `found` holds for a node under `node`, entering a nested function only when `enters` lets it.
function some(node: Node, sourceCode: SourceCode, found: (node: Node) => boolean, enters: (fn: Node) => boolean): boolean {
  if (found(node))
    return true

  for (const key of sourceCode.visitorKeys[node.type] ?? []) {
    const value = (node as unknown as Record<string, unknown>)[key]

    for (const child of Array.isArray(value) ? value : [value]) {
      if (child === null || typeof child !== 'object' || typeof (child as Node).type !== 'string')
        continue

      const inner = child as Node
      const fn = inner.type === 'ArrowFunctionExpression' || inner.type === 'FunctionExpression' || inner.type === 'FunctionDeclaration'

      if ((!fn || enters(inner)) && some(inner, sourceCode, found, enters))
        return true
    }
  }

  return false
}

// Whether the callback's body means something else as a loop's: its own `return` would leave the enclosing function, a `function`'s own `this` and `arguments` would be the enclosing ones, and an async callback's `await` would run the items one after another.
function keepsMeaning(callback: ArrowFunctionExpression | FunctionExpression, sourceCode: SourceCode): boolean {
  if (callback.async === true || callback.generator === true)
    return false

  if (some(callback.body, sourceCode, node => node.type === 'ReturnStatement', () => false))
    return false

  return callback.type !== 'FunctionExpression' || !some(callback.body, sourceCode, node => node.type === 'ThisExpression' || (node.type === 'Identifier' && node.name === 'arguments'), fn => fn.type === 'ArrowFunctionExpression')
}

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
        const inStatementPosition = node.parent.type === 'ExpressionStatement'
        const inArrowBody = node.parent.type === 'ArrowFunctionExpression' && node.parent.body === node

        context.report({
          node,
          messageId: 'preferForOf',
          fix: ((inStatementPosition || inArrowBody) && (oneParam || twoParams) && node.arguments.length === 1 && keepsMeaning(callback, sourceCode))
            ? (fixer) => {
              const array = sourceCode.getText(node.callee.type === 'MemberExpression' ? node.callee.object : node.callee)
              const param = sourceCode.getText(params[0])
              const bodyNode = callback.body
              const body = bodyNode.type === 'BlockStatement'
                ? sourceCode.getText(bodyNode)
                : `{ ${sourceCode.getText(bodyNode)} }`

              const loop = twoParams
                ? `for (const [${sourceCode.getText(params[1])}, ${param}] of ${array}.entries()) ${body}`
                : `for (const ${param} of ${array}) ${body}`

              return fixer.replaceText(node, inArrowBody ? `{ ${loop} }` : loop)
            }
            : null,
        })
      },
    }
  },
}

export default rule
