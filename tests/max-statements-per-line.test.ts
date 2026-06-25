import { describe, it } from 'bun:test'
import { RuleTester } from 'eslint'
import rule from '../src/rules/max-statements-per-line'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester()
const esm = { languageOptions: { sourceType: 'module' as const } }

tester.run('max-statements-per-line', rule, {
  valid: [
    'var bar = 1;',
    'if (condition) var bar = 1;',
    'if (condition) { }',
    'if (condition) { } else { }',
    'if (condition) {\nvar bar = 1;\n} else {\nvar bar = 1;\n}',
    'for (var i = 0; i < length; ++i) { }',
    'function foo() { }',
    '(function() { })();',
    'var foo = function foo() { };',
    { code: 'var bar = 1; var baz = 2;', options: [{ max: 2 }] },
    { code: 'if (condition) { var bar = 1; }', options: [{ max: 2 }] },
    { code: 'var bar = 1; var baz = 2; var qux = 3;', options: [{ max: 3 }] },
    { code: 'if (foo > 1)\n    foo--;\nelse\n    foo++;' },
    // export declarations don't double-count their inner declaration
    { code: 'export default foo = 0;', ...esm },
    { code: 'export let foo = 0;', ...esm },
    { code: 'export default async function astro() {\n  foo()\n}', ...esm },
    { code: 'export default function foo() {\n   console.log(\'test\');\n}', ...esm },
    { code: 'export function foo() {\n   console.log(\'test\');\n}', ...esm },
    // ignoredNodes
    {
      code: 'const a = 1; export const b = 2; export const c = 3;',
      options: [{ max: 1, ignoredNodes: ['ExportNamedDeclaration'] }],
      ...esm,
    },
  ],
  invalid: [
    {
      code: 'var bar = 1; var baz = 2;',
      errors: [{ messageId: 'exceed' }],
      output: 'var bar = 1;\nvar baz = 2;',
    },
    {
      code: 'if (condition) var bar = 1; if (condition) var baz = 2;',
      errors: [{ messageId: 'exceed' }],
      output: 'if (condition) var bar = 1;\nif (condition) var baz = 2;',
    },
    // else-branch IS counted (it's the alternate)
    {
      code: 'if (condition) var bar = 1; else var baz = 1;',
      errors: [{ messageId: 'exceed' }],
      output: 'if (condition) var bar = 1;\nelse var baz = 1;',
    },
    // else keyword on same line as consequent — else moves to new line
    {
      code: 'if (condition)\n    bar = 2; else\n    baz = 2',
      errors: [{ messageId: 'exceed' }],
      output: 'if (condition)\n    bar = 2;\nelse\n    baz = 2',
    },
    {
      code: 'if (condition) { } if (condition) { }',
      errors: [{ messageId: 'exceed' }],
      output: 'if (condition) { }\nif (condition) { }',
    },
    {
      code: 'if (condition) { var bar = 1; } else { }',
      errors: [{ messageId: 'exceed' }],
      output: 'if (condition) {\nvar bar = 1; } else { }',
    },
    {
      code: 'for (var i = 0; i < length; ++i) { var bar = 1; }',
      errors: [{ messageId: 'exceed' }],
      output: 'for (var i = 0; i < length; ++i) {\nvar bar = 1; }',
    },
    {
      code: 'function foo() { var bar = 1; }',
      errors: [{ messageId: 'exceed' }],
      output: 'function foo() {\nvar bar = 1; }',
    },
    {
      code: '(function() { var bar = 1; })();',
      errors: [{ messageId: 'exceed' }],
      output: '(function() {\nvar bar = 1; })();',
    },
    // indentation preserved
    {
      code: '  foo(); bar()',
      errors: [{ messageId: 'exceed' }],
      output: '  foo();\n  bar()',
    },
    // export
    {
      code: 'export default function foo() { console.log(\'test\') }',
      ...esm,
      errors: [{ messageId: 'exceed' }],
      output: 'export default function foo() {\nconsole.log(\'test\') }',
    },
    {
      code: 'export function foo() { console.log(\'test\') }',
      ...esm,
      errors: [{ messageId: 'exceed' }],
      output: 'export function foo() {\nconsole.log(\'test\') }',
    },
    // max option: first extra is the (max+1)th statement
    {
      code: 'var bar = 1; var baz = 2; var qux = 3;',
      options: [{ max: 2 }],
      errors: [{ messageId: 'exceed' }],
      output: 'var bar = 1; var baz = 2;\nvar qux = 3;',
    },
  ],
})
