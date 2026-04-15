import { describe, it } from 'bun:test'
import { RuleTester } from 'eslint'
import rule from '../src/rules/no-empty-first-last-line'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester()

tester.run('no-empty-first-last-line', rule, {
  valid: [
    // singleline — always OK
    'const a = [1, 2, 3]',
    'const o = { a: 1, b: 2 }',
    'const a = []',
    'const o = {}',

    // multiline without empty first/last lines
    'const a = [\n  1,\n  2,\n]',
    'const o = {\n  a: 1,\n  b: 2,\n}',

    // middle empty lines are allowed
    'const a = [\n  1,\n\n  2,\n]',
    'const o = {\n  a: 1,\n\n  b: 2,\n}',

    // content on same line as opening bracket — no empty "first line"
    'const a = [1,\n  2,\n]',

    // content on same line as closing bracket — no empty "last line"
    'const a = [\n  1,\n  2]',
  ],
  invalid: [
    // array empty first line
    {
      code: 'const a = [\n\n  1,\n  2,\n]',
      errors: [{ messageId: 'noEmptyFirstLine' }],
      output: 'const a = [\n  1,\n  2,\n]',
    },

    // array empty last line
    {
      code: 'const a = [\n  1,\n  2,\n\n]',
      errors: [{ messageId: 'noEmptyLastLine' }],
      output: 'const a = [\n  1,\n  2,\n]',
    },

    // array both empty first and last lines (two non-conflicting fixes applied in one pass)
    {
      code: 'const a = [\n\n  1,\n  2,\n\n]',
      errors: [{ messageId: 'noEmptyFirstLine' }, { messageId: 'noEmptyLastLine' }],
      output: 'const a = [\n  1,\n  2,\n]',
    },

    // object empty first line
    {
      code: 'const o = {\n\n  a: 1,\n}',
      errors: [{ messageId: 'noEmptyFirstLine' }],
      output: 'const o = {\n  a: 1,\n}',
    },

    // object empty last line
    {
      code: 'const o = {\n  a: 1,\n\n}',
      errors: [{ messageId: 'noEmptyLastLine' }],
      output: 'const o = {\n  a: 1,\n}',
    },

    // object both empty first and last lines (two non-conflicting fixes applied in one pass)
    {
      code: 'const o = {\n\n  a: 1,\n\n}',
      errors: [{ messageId: 'noEmptyFirstLine' }, { messageId: 'noEmptyLastLine' }],
      output: 'const o = {\n  a: 1,\n}',
    },

    // single empty line between brackets — reported only once (first line check)
    {
      code: 'const a = [\n\n]',
      errors: [{ messageId: 'noEmptyFirstLine' }],
      output: 'const a = [\n]',
    },

    // whitespace-only line counts as empty
    {
      code: 'const a = [\n   \n  1,\n]',
      errors: [{ messageId: 'noEmptyFirstLine' }],
      output: 'const a = [\n  1,\n]',
    },
  ],
})
