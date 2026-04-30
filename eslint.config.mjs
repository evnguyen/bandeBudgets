import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-plugin-prettier'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import unusedImports from 'eslint-plugin-unused-imports'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import prettierConfig from './prettier.config.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
})

const eslintConfig = [
	{
		ignores: [
			'node_modules',
			'next-env.d.ts',
			'.husky',
			'.next',
			'.vscode',
			'.next/**/*',
			'public',
			'public/**/*',
			'components/ui/**',
			'.git',
			'dist',
			'coverage',
			'**/._*',
			'**/._*.*'
		]
	},

	...compat.extends('prettier'),

	{
		plugins: {
			react: reactPlugin,
			'react-hooks': reactHooks,
			prettier,
			'unused-imports': unusedImports,
			import: importPlugin,
			'@next/next': nextPlugin
		},
		settings: {
			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
					project: './tsconfig.json'
				}
			}
		},
		rules: {
			'prettier/prettier': ['error', prettierConfig],
			'react/no-unescaped-entities': 'error',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'error',
			'import/extensions': [
				'error',
				'ignorePackages',
				{
					ts: 'never',
					tsx: 'never',
					js: 'never',
					jsx: 'never'
				}
			],
			'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
			'no-duplicate-imports': 'error',
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'error',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_'
				}
			],
			eqeqeq: 'error',
			'no-var': 'error',
			'prefer-const': 'error',
			'no-shadow': 'error',
			curly: 'error',
			'dot-notation': 'error',
			'no-else-return': 'error',
			complexity: ['warn', 50],
			'max-depth': ['warn', 5],
			'max-lines': ['warn', { max: 600, skipBlankLines: true, skipComments: true }]
		}
	},
	{
		files: ['**/*.+(ts|tsx)'],
		languageOptions: {
			parser: tsParser
		},
		plugins: {
			'@typescript-eslint': typescriptEslintEslintPlugin,
			'unused-imports': unusedImports
		},
		rules: {
			'no-unused-vars': 'off',
			'no-use-before-define': 'off',
			'unused-imports/no-unused-vars': [
				'error',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					ignoreRestSiblings: true,
					varsIgnorePattern: '^_',
					argsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-use-before-define': ['error', { functions: false }],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/consistent-type-definitions': 'off',
			'no-restricted-imports': [
				'error',
				{
					patterns: ['./*', '../*']
				}
			]
		}
	},

	{
		files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
		plugins: {
			'jsx-a11y': jsxA11y,
			'@next/next': nextPlugin
		},
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true
				}
			}
		},
		rules: {
			...nextPlugin.configs.recommended.rules,
			...nextPlugin.configs['core-web-vitals'].rules
		}
	}
]

export default eslintConfig
