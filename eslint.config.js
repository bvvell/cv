import globals from 'globals';
import typescriptEslint from 'typescript-eslint';
import pluginImport from 'eslint-plugin-import';
import eslint from '@eslint/js';
import eslintPluginVue from 'eslint-plugin-vue';
import vitest from '@vitest/eslint-plugin';
import vueParser from 'vue-eslint-parser';

export default typescriptEslint.config(
    {
        name: 'app/files-to-ignore',
        ignores: [
            '*.d.ts',
            '**/coverage',
            '**/dist/**',
            '**/dist-ssr/**',
            '**/coverage/**',
            '**/src/__V1/**' /* Vue2 app files */,
            '**/scripts/**/*',
        ],
    },
    {
        plugins: {
            import: pluginImport,
        },
        extends: [eslint.configs.recommended, ...typescriptEslint.configs.recommended],
        files: ['**/*.{js,ts,mts,tsx}'],
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
            'import/named': 'warn',
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

