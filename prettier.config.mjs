/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */

const prettierConfig = {
	arrowParens: 'avoid',
	bracketSameLine: false,
	bracketSpacing: true,
	htmlWhitespaceSensitivity: 'css',
	insertPragma: false,
	printWidth: 120,
	tabWidth: 2,
	useTabs: true,
	semi: false,
	singleQuote: true,
	jsxSingleQuote: false,
	trailingComma: 'none',
	proseWrap: 'always',
	quoteProps: 'as-needed',
	requirePragma: false,
	endOfLine: 'lf',
	importOrder: [
		'^(react/(.*)$)|^(react$)',
		'^(next/(.*)$)|^(next$)',
		'^@constants(/.*)?$',
		'^lucide-react$',
		'<BUILTIN_MODULES>',
		'<TYPES>^(node:)',
		'<TYPES>',
		'^@components(/.*)?$',
		'^@features(/.*)?$',
		'^@lib(/.*)?$',
		'^@providers(/.*)?$',
		'^@types(/.*)?$',
		'^@utils(/.*)?$',
		'^@/(.*)$',
		'^[./]'
	],
	importOrderSeparation: false,
	importOrderSortSpecifiers: true,
	importOrderCaseInsensitive: true,
	plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
	overrides: [
		{
			files: ['*.json', '*.yml'],
			options: {
				tabWidth: 2
			}
		},
		{
			files: ['*.md'],
			options: {
				proseWrap: 'always'
			}
		}
	]
}

export default prettierConfig
