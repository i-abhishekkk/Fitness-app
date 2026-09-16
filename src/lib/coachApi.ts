import type { User } from 'firebase/auth'

export interface CoachChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function askCoach(user: User, message: string, context: string, history: CoachChatMessage[]): Promise<string> {
  const workerUrl = import.meta.env.VITE_AI_WORKER_URL
  if (!workerUrl) throw new Error('AI coach is not configured yet.')

  const idToken = await user.getIdToken()
  const res = await fetch(workerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ message, context, history }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { error?: string })
    throw new Error(body.error || `Coach request failed (${res.status})`)
  }

  const data = (await res.json()) as { reply: string }
  return data.reply
}
