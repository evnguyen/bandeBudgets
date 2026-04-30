export const toChartKey = (name: string, index: number): string => {
	return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'category'}-${index}`
}
