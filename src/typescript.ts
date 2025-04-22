import type { Awaitable, OptionsFormatters, TypedFlatConfigItem } from '@antfu/eslint-config'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'
import type { Linter } from 'eslint/universal'
import antfu from '@antfu/eslint-config'
import github from 'eslint-plugin-github'
import { commonRules } from '~'

export function typescript(options?: {
  formatters?: OptionsFormatters
}, ...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]>[]) {
  return antfu({
    plugins: { github },
    formatters: options?.formatters,
    typescript: true,
    //
    rules: commonRules,
  }, ...userConfigs)
}

export default typescript
