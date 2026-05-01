import type { BudgetMonthSummary } from '@/lib/types'

const RATE_LIMIT_MAP = new Map<string, { windowStart: number; count: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_MAX = 10

export function isRateLimited(userId: string): boolean {
	const now = Date.now()
	const entry = RATE_LIMIT_MAP.get(userId)

	if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
		RATE_LIMIT_MAP.set(userId, { windowStart: now, count: 1 })
		return false
	}

	if (entry.count >= RATE_LIMIT_MAX) {
		return true
	}

	entry.count += 1
	return false
}

export const SYSTEM_PROMPT = `You are a personal finance advisor reviewing a user's zero-based monthly budget.
Provide clear, specific, actionable insights. Use plain text only — no markdown, no asterisks, no bullet symbols.
Structure your response with exactly these headings followed by a colon and newline:
SPENDING TRENDS:
TOP CONCERNS:
POSITIVE HABITS:
RECOMMENDATIONS:
Keep each section to 2-4 sentences. Cite dollar amounts where relevant.`

function formatHistory(history: BudgetMonthSummary[]): string {
	return history
		.map(month => {
			const categoryLines = month.categories
				.map(
					category => `    ${category.name} [${category.type}]: $${category.planned} planned / $${category.spent} spent`
				)
				.join('\n')

			return `Month: ${month.month}\n  Income: $${month.totalIncome} / Expenses: $${month.totalExpenses}\n  Categories:\n${categoryLines}`
		})
		.join('\n\n')
}

export function buildUserMessage(history: BudgetMonthSummary[], userContext: string): string {
	const parts = [
		`Budget history (last ${history.length} month${history.length === 1 ? '' : 's'}):\n`,
		formatHistory(history)
	]

	if (userContext.trim()) {
		parts.push(`\nAdditional context: "${userContext.trim()}"`)
	}

	parts.push('\nBased on the above, provide your analysis.')
	return parts.join('\n')
}

export class ModelUnavailableError extends Error {}
export class FatalError extends Error {}

export async function callModel(model: string, systemPrompt: string, userMessage: string): Promise<string> {
	const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
			'Content-Type': 'application/json',
			'HTTP-Referer': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'localhost:3000',
			'X-Title': 'BandeBudgets'
		},
		body: JSON.stringify({
			model,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userMessage }
			],
			max_tokens: 600,
			temperature: 0.7
		})
	})

	const responseBody = await response.text()

	if (!response.ok) {
		console.error(`[ai-insights] ${model} → HTTP ${response.status}:`, responseBody)

		if (response.status === 401) {
			throw new FatalError('auth')
		}

		if (response.status === 403) {
			const isQuota = responseBody.includes('limit exceeded') || responseBody.includes('daily limit')
			throw new FatalError(isQuota ? 'daily_limit' : 'auth')
		}

		if (response.status === 400) {
			throw new FatalError('bad_request')
		}

		throw new ModelUnavailableError(`${model} returned ${response.status}`)
	}

	let parsed: { choices: { message: { content: string } }[] }
	try {
		parsed = JSON.parse(responseBody) as { choices: { message: { content: string } }[] }
	} catch {
		throw new ModelUnavailableError(`${model} returned non-JSON`)
	}

	const content = parsed.choices?.[0]?.message?.content
	if (!content) {
		throw new ModelUnavailableError(`${model} returned empty content`)
	}

	return content
}
