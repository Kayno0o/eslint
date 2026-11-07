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

    // arrow expression body → wrap the loop in a block
    {
      code: 'createEffect(on(() => data.latest, () => resets.forEach(reset => reset())))',
      errors: [{ messageId: 'preferForOf' }],
      output: 'createEffect(on(() => data.latest, () => { for (const reset of resets) { reset() } }))',
    },

    // a return of the callback skips an item; as a loop's it would leave the function → report without autofix
    {
      code: 'function f(arr) { arr.forEach(x => { if (x) return; use(x) }) }',
      errors: [{ messageId: 'preferForOf' }],
      output: null,
    },

    // a return nested in a switch or a loop of the callback is the callback's too
    {
      code: 'arr.forEach(x => { switch (x) { case 1: return } })',
      errors: [{ messageId: 'preferForOf' }],
      output: null,
    },

    // a return of a nested function stays that function's → still fixed
    {
      code: 'arr.forEach(x => { use(() => { return x }) })',
      errors: [{ messageId: 'preferForOf' }],
      output: 'for (const x of arr) { use(() => { return x }) }',
    },

    // an async callback runs the items at once; a loop would await each in turn
    {
      code: 'arr.forEach(async x => { await use(x) })',
      errors: [{ messageId: 'preferForOf' }],
      output: null,
    },

    // a `function` callback's own this and arguments, also through a nested arrow
    {
      code: 'arr.forEach(function (x) { this.use(x) }, ctx)',
      errors: [{ messageId: 'preferForOf' }],
      output: null,
    },
    {
      code: 'arr.forEach(function (x) { later(() => use(arguments)) })',
      errors: [{ messageId: 'preferForOf' }],
      output: null,
    },

    // a thisArg the loop would drop
    {
      code: 'arr.forEach(x => { use(x) }, make())',
      errors: [{ messageId: 'preferForOf' }],
      output: null,
    },

    // this inside a nested function, or under an arrow callback, keeps its meaning → still fixed
    {
      code: 'arr.forEach(function (x) { use(function () { return this }) })',
      errors: [{ messageId: 'preferForOf' }],
      output: 'for (const x of arr) { use(function () { return this }) }',
    },
    {
      code: 'arr.forEach(x => { this.use(x) })',
      errors: [{ messageId: 'preferForOf' }],
      output: 'for (const x of arr) { this.use(x) }',
    },

    // not in statement position (call argument) → report without autofix
    {
      code: 'wrap(arr.forEach(x => use(x)))',
      errors: [{ messageId: 'preferForOf' }],
      output: null,
    },
  ],
})
