// Temporary — adds the GitHub Pages domain to Firebase Auth's authorized domains list
// (it was missing, which is why Google sign-in was failing on the live site).
import { GoogleAuth } from 'google-auth-library'

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
const auth = new GoogleAuth({ credentials: serviceAccount, scopes: 'https://www.googleapis.com/auth/cloud-platform' })
const client = await auth.getClient()
const { token } = await client.getAccessToken()
const project = serviceAccount.project_id

const current = await fetch(`https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/config`, {
  headers: { Authorization: `Bearer ${token}` },
}).then((r) => r.json())

const domain = 'i-abhishekkk.github.io'
const authorizedDomains = [...new Set([...current.authorizedDomains, domain])]
console.log('Current:', current.authorizedDomains)
console.log('Setting: ', authorizedDomains)

const res = await fetch(
  `https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/config?updateMask=authorizedDomains`,
  {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorizedDomains }),
  },
)
console.log(res.status, JSON.stringify(await res.json(), null, 2))
