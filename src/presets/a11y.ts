import type { Rules, TypedFlatConfigItem } from '../types'
import { interopDefault } from '../plugins'

const RULES: Rules = {
  'alt-text': 'error',
  'anchor-ambiguous-text': 'error',
  'anchor-has-content': 'error',
  'anchor-is-valid': 'error',
  'aria-activedescendant-has-tabindex': 'error',
  'aria-props': 'error',
  'aria-proptypes': 'error',
  'aria-role': 'error',
  'aria-unsupported-elements': 'error',
  'autocomplete-valid': 'error',
  'click-events-have-key-events': 'error',
  'heading-has-content': 'error',
  'html-has-lang': 'error',
  'iframe-has-title': 'error',
  'img-redundant-alt': 'error',
  'interactive-supports-focus': 'error',
  'label-has-associated-control': 'error',
  'lang': 'error',
  'media-has-caption': 'error',
  'mouse-events-have-key-events': 'error',
  'no-access-key': 'error',
  'no-aria-hidden-on-focusable': 'error',
  'no-autofocus': 'error',
  'no-distracting-elements': 'error',
  'no-interactive-element-to-noninteractive-role': [
    'error',
    {
      canvas: ['img'],
      tr: ['none', 'presentation'],
    },
  ],
  'no-noninteractive-element-interactions': [
    'error',
    {
      alert: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
      body: ['onError', 'onLoad'],
      dialog: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
      handlers: ['onClick', 'onError', 'onLoad', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
      iframe: ['onError', 'onLoad'],
      img: ['onError', 'onLoad'],
    },
  ],
  'no-noninteractive-element-to-interactive-role': [
    'error',
    {
      fieldset: ['radiogroup', 'presentation'],
      li: ['menuitem', 'menuitemradio', 'menuitemcheckbox', 'option', 'row', 'tab', 'treeitem'],
      ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
      table: ['grid'],
      td: ['gridcell'],
      ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
    },
  ],
  'no-noninteractive-tabindex': [
    'error',
    {
      allowExpressionValues: true,
      roles: ['tabpanel'],
      tags: [],
    },
  ],
  'no-redundant-roles': 'error',
  'no-static-element-interactions': [
    'error',
    {
      allowExpressionValues: true,
      handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
    },
  ],
  'prefer-tag-over-role': 'error',
  'role-has-required-aria-props': 'error',
  'role-supports-aria-props': 'error',
  'scope': 'error',
  'tabindex-no-positive': 'error',
}

function namespaced(namespace: string): Rules {
  return Object.fromEntries(Object.entries(RULES).map(([rule, entry]) => [`${namespace}/${rule}`, entry]))
}

export async function a11y(): Promise<TypedFlatConfigItem[]> {
  const pluginA11y = await interopDefault(import('eslint-plugin-jsx-a11y'))

  return [
    {
      name: 'kaynooo/a11y/setup',
      plugins: { 'jsx-a11y': pluginA11y },
    },
    {
      name: 'kaynooo/a11y/rules',
      files: [
        '**/*.?([cm])jsx',
        '**/*.?([cm])tsx',
      ],
      settings: {
        'jsx-a11y': {
          attributes: { for: ['for', 'htmlFor'] },
        },
      },
      rules: namespaced('jsx-a11y'),
    },
  ]
}

/** Astro templates run the same rules through `eslint-plugin-astro`, which owns the JSX-to-Astro attribute mapping. */
export function a11yAstro(): TypedFlatConfigItem[] {
  return [
    {
      name: 'kaynooo/a11y/astro',
      files: ['**/*.astro'],
      rules: namespaced('astro/jsx-a11y'),
    },
  ]
}
