import type { Rule } from 'eslint'

const rule: Rule.RuleModule = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: { description: 'disallow empty first/last line in multiline arrays and objects' },
    schema: [],
    messages: {
      noEmptyFirstLine: 'Unexpected empty line at the beginning of {{type}}.',
      noEmptyLastLine: 'Unexpected empty line at the end of {{type}}.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode

    function checkNode(node: Rule.Node, typeName: string) {
      const openToken = sourceCode.getFirstToken(node)!
      const closeToken = sourceCode.getLastToken(node)!

      // Only check multiline nodes
      if (openToken.loc.start.line === closeToken.loc.end.line)
        return

      const lines = sourceCode.lines

      // Only check first empty line if the opening bracket is the last non-whitespace
      // character on its line (otherwise the first "line" of content is on the same line as the bracket)
      const openLineRest = lines[openToken.loc.start.line - 1].slice(openToken.loc.end.column)

      if (openLineRest.trim() === '') {
        // Line immediately after the opening bracket (1-indexed: openToken.loc.start.line + 1)
        const firstLine = lines[openToken.loc.start.line] // 0-indexed = 1-indexed line + 1 - 1

        if (firstLine !== undefined && firstLine.trim() === '') {
          const lineNumber1Indexed = openToken.loc.start.line + 1

          context.report({
            node,
            loc: { line: lineNumber1Indexed, column: 0 },
            messageId: 'noEmptyFirstLine',
            data: { type: typeName },
            fix(fixer) {
              const start = sourceCode.getIndexFromLoc({ line: lineNumber1Indexed, column: 0 })
              const end = sourceCode.getIndexFromLoc({ line: lineNumber1Indexed + 1, column: 0 })

              return fixer.removeRange([start, end])
            },
          })
        }
      }

      // Only check last empty line if the closing bracket is the first non-whitespace
      // character on its line
      const closeLineStart = lines[closeToken.loc.end.line - 1].slice(0, closeToken.loc.start.column)

      if (closeLineStart.trim() === '') {
        // Line immediately before the closing bracket (1-indexed: closeToken.loc.end.line - 1)
        const lastLineIndex = closeToken.loc.end.line - 2 // 0-indexed
        // Avoid double-reporting if this is the same line as the first-line check
        const firstLineIndex = openToken.loc.start.line // 0-indexed

        if (lastLineIndex !== firstLineIndex) {
          const lastLine = lines[lastLineIndex]

          if (lastLine !== undefined && lastLine.trim() === '') {
            const lineNumber1Indexed = closeToken.loc.end.line - 1

            context.report({
              node,
              loc: { line: lineNumber1Indexed, column: 0 },
              messageId: 'noEmptyLastLine',
              data: { type: typeName },
              fix(fixer) {
                const start = sourceCode.getIndexFromLoc({ line: lineNumber1Indexed, column: 0 })
                const end = sourceCode.getIndexFromLoc({ line: lineNumber1Indexed + 1, column: 0 })

                return fixer.removeRange([start, end])
              },
            })
          }
        }
      }
    }

    return {
      ArrayExpression(node) { checkNode(node, 'array') },
      ObjectExpression(node) { checkNode(node, 'object') },
    }
  },
}

export default rule
