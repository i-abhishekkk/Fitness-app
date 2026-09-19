import { getGoogleAccessToken, type ServiceAccount } from './google-auth'
import { findDueReminder, LINK } from './reminder-schedule'

const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore'
const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging'

interface FirestoreValue {
  stringValue?: string
  booleanValue?: boolean
  nullValue?: null
  mapValue?: { fields?: Record<string, FirestoreValue> }
}
interface FirestoreDocument {
  name?: string
  fields?: Record<string, FirestoreValue>
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

async function listUserIds(token: string, projectId: string, dbId: string): Promise<string[]> {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/users`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const data = (await res.json()) as { documents?: FirestoreDocument[] }
  return (data.documents ?? []).map((d) => d.name!.split('/').pop()!)
}

async function getPushInfo(
  token: string,
  projectId: string,
  dbId: string,
  uid: string,
): Promise<{ enabled: boolean; fcmToken: string | null } | null> {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/users/${uid}/state/app`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) return null
  const doc = (await res.json()) as FirestoreDocument
  const push = doc.fields?.push?.mapValue?.fields
  if (!push) return null
  return {
    enabled: push.enabled?.booleanValue === true,
    fcmToken: push.token?.stringValue ?? null,
  }
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
      message: {
        token: fcmToken,
        notification: { title, body },
        webpush: { fcm_options: { link: LINK } },
      },
    }),
  })
  if (res.ok) return { ok: true, deadToken: false }
  const errText = await res.text()
  const deadToken = res.status === 404 || /UNREGISTERED|NOT_FOUND/i.test(errText)
  console.error(`FCM send failed (${res.status}):`, errText)
  return { ok: false, deadToken }
}

/** Runs on every Cron Trigger firing (every minute — see wrangler.toml). Returns null on
 *  the (vast majority of) minutes with nothing due, so the caller can skip logging noise. */
export async function sendScheduledReminder(now: Date, serviceAccount: ServiceAccount): Promise<string | null> {
  const message = findDueReminder(now)
  if (!message) return null

  const [firestoreToken, fcmToken] = await Promise.all([
    getGoogleAccessToken(serviceAccount, [FIRESTORE_SCOPE]),
    getGoogleAccessToken(serviceAccount, [FCM_SCOPE]),
  ])
  const projectId = serviceAccount.project_id
  const dbId = await findDatabaseId(firestoreToken, projectId)
  const userIds = await listUserIds(firestoreToken, projectId, dbId)

  let sent = 0
  for (const uid of userIds) {
    const push = await getPushInfo(firestoreToken, projectId, dbId, uid)
    if (!push?.enabled || !push.fcmToken) continue

    const result = await sendFcm(fcmToken, projectId, push.fcmToken, message.title, message.body)
    if (result.ok) sent++
    else if (result.deadToken) await clearDeadToken(firestoreToken, projectId, dbId, uid)
  }

  return `Sent "${message.title}" to ${sent} device(s).`
}
