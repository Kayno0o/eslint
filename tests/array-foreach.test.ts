import { describe, test } from 'bun:test'
import { RuleTester } from 'eslint'
import rule from '../src/rules/array-foreach'

const tester = new RuleTester()

describe('array-foreach', () => {
  test('valid', () => {
    tester.run('array-foreach', rule, {
      valid: [
        'for (const x of arr) {}',
        'arr.map(x => x)',
        'arr.filter(x => x)',
      ],
      invalid: [],
    })
  })

  test('invalid - no fix (function reference)', () => {
    tester.run('array-foreach', rule, {
      valid: [],
      invalid: [
        { code: '[1,2,3].forEach(fn)', errors: [{ messageId: 'preferForOf' }] },
      ],
    })
  })

  test('invalid - arrow function expression body', () => {
    tester.run('array-foreach', rule, {
      valid: [],
      invalid: [
        {
          code: 'arr.forEach(x => x)',
          errors: [{ messageId: 'preferForOf' }],
          output: 'for (const x of arr) { x }',
        },
      ],
    })
  })

  test('invalid - arrow function block body', () => {
    tester.run('array-foreach', rule, {
      valid: [],
      invalid: [
        {
          code: 'arr.forEach(x => { doSomething(x) })',
          errors: [{ messageId: 'preferForOf' }],
          output: 'for (const x of arr) { doSomething(x) }',
        },
      ],
    })
  })

  test('invalid - function expression', () => {
    tester.run('array-foreach', rule, {
      valid: [],
      invalid: [
        {
          code: 'arr.forEach(function(x) { doSomething(x) })',
          errors: [{ messageId: 'preferForOf' }],
          output: 'for (const x of arr) { doSomething(x) }',
        },
      ],
    })
  })

  test('invalid - chained member expression', () => {
    tester.run('array-foreach', rule, {
      valid: [],
      invalid: [
        {
          code: 'obj.arr.forEach(x => { use(x) })',
          errors: [{ messageId: 'preferForOf' }],
          output: 'for (const x of obj.arr) { use(x) }',
        },
      ],
    })
  })
})
