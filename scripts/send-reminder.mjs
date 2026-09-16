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

initializeApp({ credential: cert(JSON.parse(keyJson)) })
const db = getFirestore()
const messaging = getMessaging()

const userRefs = await db.collection('users').listDocuments()
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
