import antfu from '@antfu/eslint-config'
import github from 'eslint-plugin-github'
import { commonRules } from './index.ts'

export const typescript = antfu({
  plugins: { github },
  typescript: true,
  rules: {
    ...commonRules,
    'antfu/no-top-level-await': 'off',
    'no-console': 'off',
  },
})

export default typescript
