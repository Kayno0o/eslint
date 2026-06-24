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

    // 2-param: value + index → entries()
    {
      code: 'byLayer.forEach((group, li) => { use(group, li) })',
      errors: [{ messageId: 'preferForOf' }],
      output: 'for (const [li, group] of byLayer.entries()) { use(group, li) }',
    },

    // 2-param: index used only in nested closure
    {
      code: 'arr.forEach((cb, i) => { cb.addEventListener("change", () => fn(i, cb.checked)) })',
      errors: [{ messageId: 'preferForOf' }],
      output: 'for (const [i, cb] of arr.entries()) { cb.addEventListener("change", () => fn(i, cb.checked)) }',
    },

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
