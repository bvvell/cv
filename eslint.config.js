/**
 * ESLint flat config.
 *
 * Why:
 * - TypeScript + Vue SFC parsing requires a few plugins/parsers.
 * - We ignore generated output and helper scripts to keep lint focused on app source.
 */
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';
import pluginImport from 'eslint-plugin-import-x';
import eslint from '@eslint/js';
import eslintPluginVue from 'eslint-plugin-vue';
import vitest from '@vitest/eslint-plugin';
import vueParser from 'vue-eslint-parser';
import {defineConfig} from 'eslint/config';

export default defineConfig(
    {
        name: 'app/files-to-ignore',
        ignores: [
            '**/*.d.ts',
            '**/coverage',
            '**/dist/**',
            '**/dist-ssr/**',
            '**/coverage/**',
            '**/src/__V1/**' /* Vue2 app files */,
        ],
    },
    {
        plugins: {
            import: pluginImport,
        },
        extends: [eslint.configs.recommended, ...typescriptEslint.configs.recommended],
        files: ['**/*.{js,ts,mts,tsx,vue}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
        },
        rules: {
            // common
            'no-unused-vars': 'off',
            'no-undef': 'off',
            'no-useless-escape': 'off',
            'no-console': 'warn',
            'no-debugger': 'warn',
            // ts
            '@typescript-eslint/no-unused-vars': ['error', {ignoreRestSiblings: true}],
            '@typescript-eslint/explicit-module-boundary-types': 0,
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports', // Require type imports to be explicit (e.g., `import type { ... }`)
                    disallowTypeAnnotations: true, // Disallow type annotations in regular imports
                },
            ],
            // imports
            'import/no-named-as-default': 'off',
            'import/prefer-default-export': 'off',
            'import/no-unresolved': 'off',
            // No 'import/named': TypeScript already checks named imports, and the rule
            // cannot follow Vue's re-exports, so it only produced false warnings in CI.
            'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
            'import/order': [
                'error',
                {
                    pathGroups: [
                        {
                            pattern: '@/**',
                            group: 'internal',
                            position: 'after',
                        },
                    ],
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'unknown',
                        'parent',
                        'sibling',
                        'index',
                        'object',
                    ],
                },
            ],
        },
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
    },
    {
        // Why type-aware rules only here: app code is typed, while configs and
        // scripts are plain JS where every plugin import is `any`.
        name: 'app/type-checked',
        files: ['src/**/*.{ts,vue}'],
        extends: [...typescriptEslint.configs.recommendedTypeChecked],
        languageOptions: {
            parserOptions: {
                extraFileExtensions: ['.vue'],
            },
        },
    },
    {
        name: 'scripts/js-only',
        files: ['scripts/**/*.mjs'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.node,
        },
        rules: {
            'no-console': 'off',
        },
    },
    {
        files: ['src/**/__tests__/*'],
        plugins: {
            vitest,
        },
        rules: {
            ...vitest.configs.recommended.rules,
        },
        settings: {
            vitest: {
                typecheck: true,
            },
        },
        languageOptions: {
            globals: {
                ...vitest.environments.env.globals,
            },
        },
    },
    {
        plugins: {
            vue: eslintPluginVue,
        },
        extends: [...eslintPluginVue.configs['flat/recommended']],
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: typescriptEslint.parser,
                extraFileExtensions: ['.vue'],
            },
        },
        rules: {
            'vue/padding-line-between-blocks': ['error', 'always'],
            'vue/block-order': [
                'error',
                {
                    order: ['template', 'script', 'style'],
                },
            ],
            'vue/attributes-order': [
                'error',
                {
                    order: [
                        'DEFINITION',
                        'LIST_RENDERING',
                        'CONDITIONALS',
                        'RENDER_MODIFIERS',
                        'GLOBAL',
                        'UNIQUE',
                        'TWO_WAY_BINDING',
                        'OTHER_DIRECTIVES',
                        'OTHER_ATTR',
                        'EVENTS',
                        'CONTENT',
                    ],
                    alphabetical: false,
                },
            ],
        },
    },
);
