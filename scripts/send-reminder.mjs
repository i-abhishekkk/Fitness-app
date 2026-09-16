// Sends a push reminder to every user with notifications enabled. Run via the
// "Send Reminder" GitHub Actions workflow (.github/workflows/reminders.yml) on a
// schedule — not part of the web app bundle, this only ever runs in CI/Node.
//
// Usage: node scripts/send-reminder.mjs "<title>" "<body>"
// Requires FIREBASE_SERVICE_ACCOUNT_KEY env var (a Firebase service account JSON,
// as a single-line string — see the workflow for how it's supplied from a secret).

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

const [title = 'GOD MODE', body = 'Time to check in.'] = process.argv.slice(2)

const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
if (!keyJson) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not set.')
  process.exit(1)
}

const serviceAccount = JSON.parse(keyJson)
// projectId must be explicit — GitHub Actions runners have no ambient
// GOOGLE_CLOUD_PROJECT/metadata-server to infer it from, and leaving it out made the
// Admin SDK resolve to some other (nonexistent) project+database path, surfacing as a
// bare gRPC "5 NOT_FOUND" on the very first Firestore call.
initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id })
const db = getFirestore()
const messaging = getMessaging()

console.log(`Connecting to Firestore project "${serviceAccount.project_id}"...`)
let userRefs
try {
  userRefs = await db.collection('users').listDocuments()
} catch (err) {
  console.error('Firestore call failed. Top-level collections in this database:')
  try {
    const cols = await db.listCollections()
    console.error(cols.map((c) => c.id).join(', ') || '(none)')
  } catch (err2) {
    console.error('listCollections() also failed:', err2 instanceof Error ? err2.message : err2)
  }
  throw err
}
let sent = 0

for (const userRef of userRefs) {
  const appDocRef = userRef.collection('state').doc('app')
  const appDoc = await appDocRef.get()
  const push = appDoc.data()?.push

  if (!push?.enabled || !push?.token) continue

  try {
    await messaging.send({
      token: push.token,
      notification: { title, body },
      webpush: {
        fcmOptions: { link: 'https://i-abhishekkk.github.io/Fitness-app/today' },
      },
    })
    sent++
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? err.code : undefined
    console.error(`Failed to send to user ${userRef.id}:`, err instanceof Error ? err.message : err)
    // Token is dead (uninstalled, permission revoked, etc.) — clear it so the UI
    // stops claiming notifications are enabled when they no longer are.
    if (code === 'messaging/registration-token-not-registered') {
      await appDocRef.set({ push: { enabled: false, token: null } }, { merge: true })
    }
  }
}

console.log(`Sent "${title}" to ${sent} device(s).`)
