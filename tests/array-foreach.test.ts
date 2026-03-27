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

  test('invalid', () => {
    tester.run('array-foreach', rule, {
      valid: [],
      invalid: [
        { code: 'arr.forEach(x => x)', errors: [{ messageId: 'preferForOf' }] },
        { code: '[1,2,3].forEach(fn)', errors: [{ messageId: 'preferForOf' }] },
        { code: 'obj.arr.forEach(() => {})', errors: [{ messageId: 'preferForOf' }] },
      ],
    })
  })
})
