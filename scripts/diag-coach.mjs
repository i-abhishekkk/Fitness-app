// Temporary — end-to-end test of the deployed Coach Worker: mints a real Firebase ID
// token for the account owner (no browser needed) and calls the Worker with it.
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
const app = initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id })
const auth = getAuth(app)

const uid = 'HoGwDqlbIieZXT0ZUHkBK8aB5vt2'
const customToken = await auth.createCustomToken(uid)

const apiKey = process.env.FIREBASE_WEB_API_KEY
const exchangeRes = await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  },
)
const exchangeData = await exchangeRes.json()
if (!exchangeData.idToken) {
  console.error('Token exchange failed:', JSON.stringify(exchangeData))
  process.exit(1)
}
console.log('Got real ID token for uid', uid)
const payload = JSON.parse(Buffer.from(exchangeData.idToken.split('.')[1], 'base64').toString())
console.log('Token claims:', JSON.stringify({ email: payload.email, email_verified: payload.email_verified, uid: payload.user_id, firebase: payload.firebase }))

const workerRes = await fetch(process.env.WORKER_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${exchangeData.idToken}` },
  body: JSON.stringify({
    message: 'In one short sentence, what is my current weight and streak based on the data below?',
    context:
      'WEIGHT: current 66.1kg (baseline 65kg, target 76kg).\nSTREAK: current streak 2 days total logged, most recent logged day 2026-09-16.',
    history: [],
  }),
})
console.log('Worker status:', workerRes.status)
console.log(await workerRes.text())
