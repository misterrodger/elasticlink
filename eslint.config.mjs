import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import functional from 'eslint-plugin-functional';
import vitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'no-console': 'warn',
      'no-loop-func': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'error',
      'prefer-destructuring': [
        'error',
        { array: true, object: true },
        { enforceForRenamedProperties: true }
      ],
      'no-var': 'error',
      'no-param-reassign': 'error',
      'no-undef': ['error', { typeof: false }],
      'no-use-before-define': ['error', { functions: false }],
      'no-restricted-syntax': ['error', 'SwitchStatement'],
      'object-shorthand': ['error', 'always'],
      'no-useless-return': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-rename': 'error'
    }
  },
  tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    ignores: ['src/__tests__/**/*.ts'],
    plugins: { functional },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/no-unnecessary-type-conversion': 'error',
      'functional/no-classes': 'error',
      'functional/no-class-inheritance': 'error',
      'functional/no-this-expressions': 'error',
      'functional/no-mixed-types': 'error',
      'functional/immutable-data': 'error',
      'functional/no-let': 'error',
       'functional/functional-parameters': 'error',
      'functional/prefer-property-signatures': 'error',
      'functional/prefer-tacit': 'error',
      // 'functional/prefer-immutable-types': 'error',
      // 'functional/prefer-readonly-type': 'error',
      'functional/readonly-type': 'error',
      // 'functional/type-declaration-immutability': 'error',

      'functional/no-conditional-statements': 'error',
      'functional/no-expression-statements': 'error',
      'functional/no-loop-statements': 'error',
      'functional/no-return-void': 'error',
      'functional/no-throw-statements': 'error',
      'functional/no-try-statements': 'error',
      'functional/no-promise-reject': 'error',
    }
  },
  {
    files: ['src/__tests__/**/*.ts'],
    ...vitest.configs.recommended,
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/consistent-test-it': ['error', { fn: 'it' }],
      'vitest/consistent-test-filename': 'error',
      'vitest/require-top-level-describe': 'error',
      'vitest/require-hook': 'error',
      'vitest/no-duplicate-hooks': 'error',
      'vitest/prefer-hooks-in-order': 'error',
      'vitest/hoisted-apis-on-top': 'error',
      'vitest/no-test-prefixes': 'error',
      'vitest/prefer-to-be': 'error',
      'vitest/prefer-to-have-length': 'error',
      'vitest/prefer-to-have-been-called-times': 'error',
      'vitest/prefer-equality-matcher': 'error',
      'vitest/prefer-strict-equal': 'error',
      'vitest/prefer-mock-promise-shorthand': 'error',
      'vitest/prefer-expect-resolves': 'error',
      'vitest/no-conditional-in-test': 'error',
      'vitest/no-conditional-tests': 'error',
      'vitest/prefer-each': 'error',
      'vitest/prefer-todo': 'error',
      'vitest/padding-around-describe-blocks': 'error',
      'vitest/padding-around-test-blocks': 'error',
      'vitest/padding-around-expect-groups': 'error'
    }
  }
]);
