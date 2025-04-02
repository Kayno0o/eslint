// eslint-disable-next-line antfu/no-import-dist
import { typescript } from './dist/index.js'

export default typescript({
  rules: {
    'import/extensions': ['error', 'ignorePackages', {
      ts: 'never',
      tsx: 'never',
      js: 'never',
    }],
  },
})
