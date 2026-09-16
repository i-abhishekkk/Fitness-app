// Temporary diagnostic — not part of the app. Reads (read-only) the project's Identity
// Platform / Firebase Auth config to check authorized domains and enabled sign-in
// providers, using the same service account already set up for send-reminder.mjs.
import { GoogleAuth } from 'google-auth-library'

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
const auth = new GoogleAuth({ credentials: serviceAccount, scopes: 'https://www.googleapis.com/auth/cloud-platform' })
const client = await auth.getClient()
const { token } = await client.getAccessToken()
const project = serviceAccount.project_id

async function get(path) {
  const res = await fetch(`https://identitytoolkit.googleapis.com/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return { status: res.status, body: await res.json() }
}

console.log('--- config (authorizedDomains) ---')
console.log(JSON.stringify(await get(`admin/v2/projects/${project}/config`), null, 2))

console.log('--- google.com IdP config ---')
console.log(JSON.stringify(await get(`admin/v2/projects/${project}/defaultSupportedIdpConfigs/google.com`), null, 2))
