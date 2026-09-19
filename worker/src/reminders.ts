import Anthropic from '@anthropic-ai/sdk'
import { getGoogleAccessToken, type ServiceAccount } from './google-auth'
import { findDueReminder, LINK } from './reminder-schedule'

const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore'
const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging'

interface FirestoreValue {
  stringValue?: string
  booleanValue?: boolean
  integerValue?: string
  doubleValue?: number
  nullValue?: null
  mapValue?: { fields?: Record<string, FirestoreValue> }
  arrayValue?: { values?: FirestoreValue[] }
}
interface FirestoreDocument {
  name?: string
  fields?: Record<string, FirestoreValue>
}

/** Generic Firestore REST value -> plain JS value, recursive over maps/arrays. Used to read
 *  a user's full app-state doc for the weekly review (everything else in this file only ever
 *  reads the narrow `push` field, which didn't need this). */
function parseFirestoreValue(v: FirestoreValue | undefined): unknown {
  if (!v) return undefined
  if (v.stringValue !== undefined) return v.stringValue
  if (v.booleanValue !== undefined) return v.booleanValue
  if (v.integerValue !== undefined) return Number(v.integerValue)
  if (v.doubleValue !== undefined) return v.doubleValue
  if (v.nullValue !== undefined) return null
  if (v.mapValue) return parseFirestoreFields(v.mapValue.fields ?? {})
  if (v.arrayValue) return (v.arrayValue.values ?? []).map(parseFirestoreValue)
  return undefined
}
function parseFirestoreFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, parseFirestoreValue(v)]))
}

/** The Admin SDK assumes the database id is the "(default)" sentinel when none is given —
 *  this project's database isn't always registered under that exact id (bit us once
 *  already with a bare, message-less gRPC error), so ask what actually exists instead of
 *  guessing. */
async function findDatabaseId(token: string, projectId: string): Promise<string> {
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = (await res.json()) as { databases?: { name: string }[] }
  const first = data.databases?.[0]
  if (!first) throw new Error('No Firestore database found for this project.')
  return first.name.split('/').pop()!
}

interface PushTarget {
  uid: string
  enabled: boolean
  fcmToken: string | null
}

/** users/{uid} is never written directly by the app — only the nested users/{uid}/state/app
 *  is — so it doesn't "exist" as a document and a plain `documents/users` list call (or the
 *  Admin SDK's `.collection('users').listDocuments()`) returns nothing, even though every
 *  nested doc is directly fetchable by exact path (confirmed empirically: a direct GET on
 *  one user's state/app path succeeded while listing the parent collection returned `{}`).
 *  A collection-group query over `state` sidesteps the whole problem — it matches every
 *  `.../state/{docId}` document regardless of parent, in one request instead of N+1. */
async function listPushTargets(token: string, projectId: string, dbId: string): Promise<PushTarget[]> {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents:runQuery`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: { from: [{ collectionId: 'state', allDescendants: true }] },
      }),
    },
  )
  const rows = (await res.json()) as { document?: FirestoreDocument }[]
  const targets: PushTarget[] = []
  for (const row of rows) {
    const doc = row.document
    const match = doc?.name?.match(/\/users\/([^/]+)\/state\/app$/)
    if (!match) continue
    const push = doc!.fields?.push?.mapValue?.fields
    targets.push({
      uid: match[1],
      enabled: push?.enabled?.booleanValue === true,
      fcmToken: push?.token?.stringValue ?? null,
    })
  }
  return targets
}

async function clearDeadToken(token: string, projectId: string, dbId: string, uid: string): Promise<void> {
  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/users/${uid}/state/app` +
    `?updateMask.fieldPaths=push`
  await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: { push: { mapValue: { fields: { enabled: { booleanValue: false }, token: { nullValue: null } } } } },
    }),
  }).catch(() => {})
}

async function sendFcm(
  token: string,
  projectId: string,
  fcmToken: string,
  title: string,
  body: string,
): Promise<{ ok: boolean; deadToken: boolean }> {
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Data-only payload, deliberately with no top-level `notification` field. When a push
      // message carries a `notification` payload, the browser's own push handling auto-displays
      // it *in addition to* our onBackgroundMessage handler manually calling showNotification —
      // that's what was causing every reminder to arrive as two identical notifications. A
      // data-only message skips the automatic display, so our handler is the only one that shows it.
      message: {
        token: fcmToken,
        data: { title, body, link: LINK },
      },
    }),
  })
  if (res.ok) return { ok: true, deadToken: false }
  const errText = await res.text()
  const deadToken = res.status === 404 || /UNREGISTERED|NOT_FOUND/i.test(errText)
  console.error(`FCM send failed (${res.status}):`, errText)
  return { ok: false, deadToken }
}

const WEEKLY_REVIEW_SYSTEM_PROMPT = `You write a short weekly training review for a hybrid-athlete fitness app. You will be given a 7-day data snapshot (weigh-ins, sessions logged with sets/reps/weight/RPE, sleep, streak). Ground every claim strictly in that data — never invent a session, number, or trend that isn't present. If the week's data is sparse (few or no sessions logged), say that plainly and encouragingly rather than fabricating detail. Write 3-5 sentences, direct and specific (reference actual numbers), no headers or bullet points, no generic filler like "great job this week!" unless the data actually supports it.`

/** Reads a user's full app-state doc and reduces it to a compact 7-day text block for the
 *  weekly review prompt — deliberately narrower than the client's buildCoachContext (that one
 *  grounds a full chat conversation; this only needs the last week). */
function buildWeeklySummary(data: Record<string, unknown>, now: Date): string {
  const cutoff = now.getTime() - 7 * 86_400_000
  const inLast7 = (dateStr: unknown) => typeof dateStr === 'string' && new Date(dateStr).getTime() >= cutoff

  const weights = (Array.isArray(data.weights) ? data.weights : []).filter((w: any) => inLast7(w?.date))
  const sessions = (Array.isArray(data.sessions) ? data.sessions : []).filter((s: any) => inLast7(s?.date))
  const sleep = (Array.isArray(data.sleep) ? data.sleep : []).filter((s: any) => inLast7(s?.date))
  const streakDays = Array.isArray(data.streakDays) ? data.streakDays.length : 0

  const weightLines = weights.map((w: any) => `${new Date(w.date).toLocaleDateString()}: ${w.kg}kg`).join('; ') || 'none logged'
  const sessionLines =
    sessions
      .map((s: any) => {
        const exercises = Array.isArray(s.exercises)
          ? s.exercises
              .map((e: any) => {
                const r = e?.raw
                return r ? `${e.name} (${r.sets}x${r.reps} @ ${r.weightKg}kg${r.rpe ? `, RPE ${r.rpe}` : ''})` : e?.name
              })
              .filter(Boolean)
              .join(', ')
          : ''
        return `${new Date(s.date).toLocaleDateString()} (${s.dayType}): ${exercises || 'no exercises logged'}`
      })
      .join('\n') || 'no sessions logged this week'
  const sleepAvg = sleep.length ? (sleep.reduce((sum: number, s: any) => sum + (s.hours ?? 0), 0) / sleep.length).toFixed(1) : null

  return `WEIGH-INS THIS WEEK: ${weightLines}
SESSIONS THIS WEEK (${sessions.length} logged):
${sessionLines}
SLEEP THIS WEEK: ${sleepAvg ? `${sleepAvg}h avg over ${sleep.length} nights logged` : 'no data logged'}
STREAK: ${streakDays} total days logged all-time`
}

async function generateWeeklyReview(apiKey: string, summary: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey })
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 400,
    thinking: { type: 'disabled' },
    system: WEEKLY_REVIEW_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: summary }],
  })
  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
  return textBlock?.text ?? ''
}

async function writeWeeklyReview(token: string, projectId: string, dbId: string, uid: string, text: string, generatedAt: string): Promise<void> {
  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/users/${uid}/state/app` +
    `?updateMask.fieldPaths=weeklyReview`
  await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: { weeklyReview: { mapValue: { fields: { text: { stringValue: text }, generatedAt: { stringValue: generatedAt } } } } },
    }),
  })
}

/** Runs on every Cron Trigger firing (every minute — see wrangler.toml). Returns null on
 *  the (vast majority of) minutes with nothing due, so the caller can skip logging noise. */
export async function sendScheduledReminder(now: Date, serviceAccount: ServiceAccount, anthropicApiKey: string): Promise<string | null> {
  const message = findDueReminder(now)
  if (!message) return null

  const [firestoreToken, fcmToken] = await Promise.all([
    getGoogleAccessToken(serviceAccount, [FIRESTORE_SCOPE]),
    getGoogleAccessToken(serviceAccount, [FCM_SCOPE]),
  ])
  const projectId = serviceAccount.project_id
  const dbId = await findDatabaseId(firestoreToken, projectId)
  const targets = await listPushTargets(firestoreToken, projectId, dbId)

  let sent = 0
  for (const target of targets) {
    if (!target.enabled || !target.fcmToken) continue

    let title = message.title
    let body = message.body
    if (message.ai) {
      try {
        const docRes = await fetch(
          `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/users/${target.uid}/state/app`,
          { headers: { Authorization: `Bearer ${firestoreToken}` } },
        )
        const doc = (await docRes.json()) as FirestoreDocument
        const data = parseFirestoreFields(doc.fields ?? {})
        const summary = buildWeeklySummary(data, now)
        const review = await generateWeeklyReview(anthropicApiKey, summary)
        if (review) {
          await writeWeeklyReview(firestoreToken, projectId, dbId, target.uid, review, now.toISOString())
          body = review.length > 140 ? `${review.slice(0, 137)}...` : review
        }
      } catch (err) {
        console.error('Weekly review generation failed:', err)
        // fall through and send the static teaser body — better than no notification at all
      }
    }

    const result = await sendFcm(fcmToken, projectId, target.fcmToken, title, body)
    if (result.ok) sent++
    else if (result.deadToken) await clearDeadToken(firestoreToken, projectId, dbId, target.uid)
  }

  return `Sent "${message.title}" to ${sent} device(s).`
}
