import type { Awaitable, OptionsConfig, OptionsFormatters, TypedFlatConfigItem } from '@antfu/eslint-config'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'
import type { Linter } from 'eslint/universal'
import antfu from '@antfu/eslint-config'
import github from 'eslint-plugin-github'
import _ from 'lodash'
import { commonRules } from '~'

export function typescript(options?: {
  formatters?: OptionsFormatters
  overrideOptions?: OptionsConfig & Omit<TypedFlatConfigItem, 'files'>
}, ...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]>[]) {
  return antfu(_.merge({
    plugins: { github },
    formatters: options?.formatters,
    typescript: true,
    //
    rules: commonRules,
  }, options?.overrideOptions), ...userConfigs)
}

export default typescript
