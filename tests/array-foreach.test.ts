import { describe, it } from 'bun:test'
import { RuleTester } from 'eslint'
import rule from '../src/rules/array-foreach'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester()

tester.run('array-foreach', rule, {
  valid: [
    'for (const x of arr) {}',
    'arr.map(x => x)',
    'arr.filter(x => x)',
  ],
  invalid: [
    // no fix (function reference)
    { code: '[1,2,3].forEach(fn)', errors: [{ messageId: 'preferForOf' }] },

    // arrow function expression body
    {
      code: 'arr.forEach(x => x)',
      errors: [{ messageId: 'preferForOf' }],
      output: 'for (const x of arr) { x }',
    },

    // arrow function block body
    {
      code: 'arr.forEach(x => { doSomething(x) })',
      errors: [{ messageId: 'preferForOf' }],
      output: 'for (const x of arr) { doSomething(x) }',
    },

    // function expression
    {
      code: 'arr.forEach(function(x) { doSomething(x) })',
      errors: [{ messageId: 'preferForOf' }],
      output: 'for (const x of arr) { doSomething(x) }',
    },

    // chained member expression
    {
      code: 'obj.arr.forEach(x => { use(x) })',
      errors: [{ messageId: 'preferForOf' }],
      output: 'for (const x of obj.arr) { use(x) }',
    },
  ],
})
