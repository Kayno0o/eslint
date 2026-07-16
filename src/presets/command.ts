import type { TypedFlatConfigItem } from '../types'
import { pluginCommand } from '../plugins'

export function command(): TypedFlatConfigItem[] {
  return [
    {
      name: 'kaynooo/command/rules',
      ignores: [
        '**/*.md',
      ],
      plugins: {
        command: pluginCommand,
      },
      rules: {
        'command/command': 'error',
      },
    },
  ]
}
