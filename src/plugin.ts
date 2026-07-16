import arrayForeach from './rules/array-foreach'
import maxStatementsPerLine from './rules/max-statements-per-line'
import noEmptyFirstLastLine from './rules/no-empty-first-last-line'
import noThen from './rules/no-then'

export const kaynoooPlugin = {
  rules: {
    'array-foreach': arrayForeach,
    'max-statements-per-line': maxStatementsPerLine,
    'no-empty-first-last-line': noEmptyFirstLastLine,
    'no-then': noThen,
  },
}
