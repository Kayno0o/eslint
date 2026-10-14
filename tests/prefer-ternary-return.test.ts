import { describe, it } from 'bun:test'
import { RuleTester } from 'eslint'
import rule from '../src/rules/prefer-ternary-return'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester()

tester.run('prefer-ternary-return', rule, {
  valid: [
    // A guard with no value, or work between the two returns, is an early return to keep.
    'function f(a) {\n  if (!a)\n    return\n  return 1\n}',
    'function f(a) {\n  if (a)\n    return 1\n  log()\n  return 2\n}',
    'function f(a) {\n  if (a)\n    return 1\n  else\n    return 2\n}',
    // Already a ternary on one side: a second one would nest.
    'function f(a, b) {\n  if (a)\n    return b ? 1 : 2\n  return 3\n}',
    // A boolean branch reads better as an early return than as `a ? true : b`.
    'function f(a, b) {\n  if (a)\n    return true\n  return b.some(Boolean)\n}',
    // A multi-line operand or a comment would not survive as one readable line.
    'function f(a) {\n  if (a)\n    return {\n      x: 1,\n    }\n  return null\n}',
    'function f(a) {\n  if (a)\n    return 1\n  // the fallback\n  return 2\n}',
    `function f(a) {\n  if (a)\n    return '${'x'.repeat(60)}'\n  return '${'y'.repeat(60)}'\n}`,
  ],
  invalid: [
    {
      code: 'function f(admin) {\n  if (admin)\n    return \'admin\'\n  return \'user\'\n}',
      output: 'function f(admin) {\n  return admin ? \'admin\' : \'user\'\n}',
      errors: [{ messageId: 'preferTernary' }],
    },
    {
      code: 'function f(cache, key) {\n  if (cache.has(key)) {\n    return cache.get(key)\n  }\n\n  return compute(key)\n}',
      output: 'function f(cache, key) {\n  return cache.has(key) ? cache.get(key) : compute(key)\n}',
      errors: [{ messageId: 'preferTernary' }],
    },
  ],
})
