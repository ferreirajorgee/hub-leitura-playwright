import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import security from 'eslint-plugin-security';
import prettier from 'eslint-config-prettier';

// Seletores proibidos por docs/02-SELETORES_ROBUSTOS.md: IDs, classes e posição.
const SELETOR_FRAGIL = /(^|[\s>+~,(])[#.][\w-]|:nth-(child|of-type)|:(first|last)-child/;

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'playwright-report/',
      'test-results/',
      'tests/evidencias/',
      '.playwright-mcp/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  security.configs.recommended,
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-wait-for-selector': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-nth-methods': 'error',
      'playwright/no-element-handle': 'error',
      'playwright/no-eval': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': ['warn', { allowConditional: true }],
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/require-top-level-describe': 'error',
      'playwright/expect-expect': 'error',
      'playwright/no-raw-locators': 'warn',
      'no-restricted-syntax': [
        'error',
        {
          selector: `CallExpression[callee.property.name='locator'] > Literal[value=${SELETOR_FRAGIL}]`,
          message:
            'Seletor frágil (ID, classe CSS ou posição). Use getByRole/getByLabel/getByPlaceholder/getByTestId — veja docs/02-SELETORES_ROBUSTOS.md.',
        },
      ],
    },
  },
  prettier,
);
