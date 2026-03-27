import { describe, test } from 'bun:test'
import { RuleTester } from 'eslint'
import rule from '../src/rules/no-then'

const tester = new RuleTester()

describe('no-then', () => {
  test('valid', () => {
    tester.run('no-then', rule, {
      valid: [
        'async function f() { await p }',
        'const x = obj.value',
        'obj.method()',
      ],
      invalid: [],
    })
  })

  test('invalid', () => {
    tester.run('no-then', rule, {
      valid: [],
      invalid: [
        { code: 'p.then(fn)', errors: [{ messageId: 'preferAsyncAwait' }] },
        { code: 'p.catch(fn)', errors: [{ messageId: 'preferAsyncAwait' }] },
        { code: 'fetch(url).then(r => r.json()).catch(console.error)', errors: [{ messageId: 'preferAsyncAwait' }, { messageId: 'preferAsyncAwait' }] },
      ],
    })
  })
})
