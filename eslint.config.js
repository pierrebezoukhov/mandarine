// @ts-check
const tsParser = require('@typescript-eslint/parser');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    files: ['app/**/*.tsx', 'components/**/*.tsx'],
    ignores: ['node_modules/**', 'dist/**', '.expo/**'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // ── Typography guard ───────────────────────────────────────────────────
      // Raw fontSize literals must be replaced with FS.* from @/theme/tokens.
      'no-restricted-syntax': [
        'error',
        {
          selector: "Property[key.name='fontSize'] > Literal",
          message:
            "Raw font-size number. Use FS.* from '@/theme/tokens' (e.g. FS.body, FS.ui, FS.heading).",
        },
        // ── Spacing guard ──────────────────────────────────────────────────
        // Raw padding / margin / gap values ≥ 3 px must use space.* tokens.
        // Values 0, 1, 2 are exempt (resets and hairlines are intentional).
        {
          selector:
            "Property[key.name=/^(paddingTop|paddingBottom|paddingLeft|paddingRight|paddingHorizontal|paddingVertical|marginTop|marginBottom|marginLeft|marginRight|marginHorizontal|marginVertical|gap)$/] > Literal[value=/^([3-9]|[1-9][0-9]+)$/]",
          message:
            "Raw spacing value. Use space.* from '@/theme/spacing' (e.g. space.md, space.xl, space.giant).",
        },
      ],
    },
  },
];
