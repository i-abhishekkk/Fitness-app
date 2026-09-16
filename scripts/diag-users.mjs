// Temporary — lists users/* and their stored push state to see why send-reminder found 0.
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { GoogleAuth } from 'google-auth-library'

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)

async function findDatabaseId() {
  const auth = new GoogleAuth({ credentials: serviceAccount, scopes: 'https://www.googleapis.com/auth/datastore' })
  const client = await auth.getClient()
  const { token } = await client.getAccessToken()
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${serviceAccount.project_id}/databases`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const { databases } = await res.json()
  return databases[0].name.split('/').pop()
}

const app = initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id })
const db = getFirestore(app, await findDatabaseId())

const userRefs = await db.collection('users').listDocuments()
console.log(`Found ${userRefs.length} user doc(s): ${userRefs.map((u) => u.id).join(', ') || '(none)'}`)

for (const userRef of userRefs) {
  const appDoc = await userRef.collection('state').doc('app').get()
  console.log(`--- users/${userRef.id}/state/app ---`)
  console.log('exists:', appDoc.exists)
  if (appDoc.exists) {
    const data = appDoc.data()
    console.log('push field:', JSON.stringify(data.push))
    console.log('top-level keys:', Object.keys(data).join(', '))
  }
}
