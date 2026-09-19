import Anthropic from '@anthropic-ai/sdk'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { sendScheduledReminder } from './reminders'

export interface Env {
  ANTHROPIC_API_KEY: string
  FIREBASE_PROJECT_ID: string
  COACH_EMAIL: string
  ALLOWED_ORIGINS: string
  FIREBASE_SERVICE_ACCOUNT_KEY: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  message: string
  context: string
  history: ChatMessage[]
}

// Firebase ID tokens are RS256-signed by Google — verifying them needs no secret of our
// own, just Google's public keys for the token-signing service account.
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
)

const SYSTEM_PROMPT_HEADER = `You are the GOD MODE Coach — a focused, no-nonsense training and nutrition assistant built into Abhishek's personal hybrid-athlete training app (calisthenics skills + hypertrophy + cardio, the "Handstand to Muscle-Up" protocol).

Two different kinds of claims, held to different standards:
1. FACTS about Abhishek himself — his weight, skill numbers, streak, sessions, sleep, macros, what's in his existing program. These must be grounded strictly in the DATA block below, which is a real snapshot exported moments ago. Never invent numbers, dates, exercises, or facts that aren't present in it, and never present something as already part of his logged history or existing plan when it isn't. If asked something the data doesn't cover, say plainly that you don't have that information rather than guessing.
2. SUGGESTIONS — new exercises, meals, or adjustments he could add, outside his current schedule. These are welcome and expected when he asks for recommendations; use your own training/nutrition expertise freely here. Just frame them clearly as suggestions ("you could try...", "consider adding...") rather than stating them as facts about what he's already doing, and ground the reasoning behind them in his actual data (his goals, current numbers, what's worked so far) so the advice is personalized, not generic.

Be direct, specific, and encouraging without being generic — reference actual numbers from the data whenever relevant. Keep responses focused and concise (a few short paragraphs at most) unless asked for depth.`

function corsHeaders(origin: string | null, allowedOrigins: string[]): Record<string, string> {
  const allow = origin && allowedOrigins.includes(origin) ? origin : ''
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

function json(data: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    const origin = request.headers.get('Origin')
    const cors = corsHeaders(origin, allowedOrigins)

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors })
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors)

    const idToken = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    if (!idToken) return json({ error: 'Missing token' }, 401, cors)

    let email: string | undefined
    try {
      const { payload } = await jwtVerify(idToken, JWKS, {
        issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
        audience: env.FIREBASE_PROJECT_ID,
      })
      email = typeof payload.email === 'string' ? payload.email : undefined
    } catch {
      return json({ error: 'Invalid or expired token' }, 401, cors)
    }

    // Single-user app — only the account owner's own sign-in may call the AI endpoint,
    // otherwise anyone who finds this public Worker URL could burn through the API budget.
    if (email !== env.COACH_EMAIL) {
      return json({ error: 'Not authorized' }, 403, cors)
    }

    let body: ChatRequest
    try {
      body = await request.json()
    } catch {
      return json({ error: 'Invalid request body' }, 400, cors)
    }

    if (!body.message || typeof body.message !== 'string' || body.message.length > 4000) {
      return json({ error: 'Message is missing or too long' }, 400, cors)
    }

    const history = Array.isArray(body.history) ? body.history.slice(-20) : []
    const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-5',
        max_tokens: 1024,
        thinking: { type: 'disabled' },
        system: `${SYSTEM_PROMPT_HEADER}\n\n--- DATA ---\n${body.context ?? ''}`,
        messages: [...history.map((m) => ({ role: m.role, content: m.content })), { role: 'user' as const, content: body.message }],
      })
      const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
      return json({ reply: textBlock?.text ?? '' }, 200, cors)
    } catch (err) {
      console.error('Anthropic request failed:', err)
      return json({ error: 'The AI request failed. Try again in a moment.' }, 502, cors)
    }
  },

  // Cron Trigger (wrangler.toml [triggers] crons — fires every minute) — a first-class
  // scheduling primitive on this platform, unlike GitHub Actions' best-effort `schedule`
  // event, which was observed running reminders 4-5 hours late. Workers Free caps cron
  // triggers at 5/account (nowhere near the 25 distinct reminder times this needs), so
  // there's one trigger and reminder-schedule.ts does its own time-matching every minute.
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY)
    ctx.waitUntil(
      sendScheduledReminder(new Date(event.scheduledTime), serviceAccount)
        .then((result) => {
          if (result) console.log(result)
        })
        .catch((err) => console.error('Scheduled reminder failed:', err)),
    )
  },
}
