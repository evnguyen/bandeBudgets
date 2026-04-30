export const THEME_COLORS = [
	{ name: 'Blue', value: 'blue', primary: '217 91% 60%', secondary: '217 91% 70%' },
	{ name: 'Green', value: 'green', primary: '142 76% 36%', secondary: '142 76% 46%' },
	{ name: 'Purple', value: 'purple', primary: '262 83% 58%', secondary: '262 83% 68%' },
	{ name: 'Orange', value: 'orange', primary: '25 95% 53%', secondary: '25 95% 63%' },
	{ name: 'Red', value: 'red', primary: '0 72% 51%', secondary: '0 72% 61%' },
	{ name: 'Teal', value: 'teal', primary: '173 80% 40%', secondary: '173 80% 50%' },
	{ name: 'Pink', value: 'pink', primary: '330 81% 60%', secondary: '330 81% 70%' }
] as const

export type ThemeColor = (typeof THEME_COLORS)[number]['value']

export const DEFAULT_THEME_COLOR: ThemeColor = 'blue'

export const CHART_PALETTE = THEME_COLORS.map(color => `hsl(${color.primary})`)
