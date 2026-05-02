import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import {
	buildUserMessage,
	callModel,
	FatalError,
	isRateLimited,
	ModelUnavailableError,
	SYSTEM_PROMPT,
	verifyFirebaseToken
} from '@/app/api/ai-insights/utils'
import { FREE_MODELS } from '@/lib/constants/ai-models'
import { COOKIE_KEYS } from '@/lib/constants/keys'
import type { AiInsightsRequest } from '@/lib/types'

export async function POST(request: NextRequest): Promise<NextResponse> {
	const cookieStore = await cookies()
	if (cookieStore.get(COOKIE_KEYS.ACCESS_GRANTED)?.value !== '1') {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	if (!process.env.OPEN_ROUTER_API_KEY) {
		return NextResponse.json({ error: 'AI service is not configured.' }, { status: 500 })
	}

	const authHeader = request.headers.get('Authorization')
	const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

	if (!token) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	let userId: string
	try {
		userId = await verifyFirebaseToken(token)
	} catch {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	let body: AiInsightsRequest
	try {
		body = (await request.json()) as AiInsightsRequest
	} catch {
		return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
	}

	const { budgetHistory, userContext } = body

	if (!Array.isArray(budgetHistory) || budgetHistory.length === 0) {
		return NextResponse.json({ error: 'No budget history provided.' }, { status: 400 })
	}

	if (budgetHistory.length > 12) {
		return NextResponse.json({ error: 'Too many months provided.' }, { status: 400 })
	}

	if (userContext && userContext.length > 500) {
		return NextResponse.json({ error: 'Context too long. Keep it under 500 characters.' }, { status: 400 })
	}

	if (isRateLimited(userId)) {
		return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
	}

	const userMessage = buildUserMessage(budgetHistory, userContext ?? '')

	for (const model of FREE_MODELS) {
		try {
			const insights = await callModel(model, SYSTEM_PROMPT, userMessage)
			console.info(`[ai-insights] success via ${model}`)
			return NextResponse.json({ insights })
		} catch (err) {
			if (err instanceof FatalError) {
				if (err.message === 'daily_limit') {
					return NextResponse.json(
						{ error: 'Daily AI limit reached. Resets tomorrow — try again then.' },
						{ status: 429 }
					)
				}
				return NextResponse.json({ error: 'AI service error. Check your API key.' }, { status: 502 })
			}
			if (err instanceof ModelUnavailableError) {
				console.warn(`[ai-insights] ${model} unavailable, rotating…`)
				continue
			}
			return NextResponse.json({ error: 'AI request failed. Please try again.' }, { status: 502 })
		}
	}

	return NextResponse.json({ error: 'AI is unavailable right now. Try again in a few minutes.' }, { status: 503 })
}
