export const FREE_MODELS = ['openai/gpt-oss-120b:free'] as const

export type FreeModel = (typeof FREE_MODELS)[number]

export const AI_INSIGHTS_COOLDOWN_MS = 60_000

export const AI_INSIGHTS_ERRORS: Record<number, string> = {
	429: 'Too many requests. Try again later.',
	500: 'AI service is not configured.',
	503: 'AI is unavailable right now. Try again in a few minutes.'
}
