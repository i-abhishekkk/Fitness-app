import { SignJWT, importPKCS8 } from 'jose'

export interface ServiceAccount {
  client_email: string
  private_key: string
  project_id: string
}

/** Exchanges a service-account key for a short-lived Google OAuth access token, entirely
 *  in the Workers runtime (WebCrypto via jose — no Node crypto, so no firebase-admin
 *  needed). Standard JWT-bearer flow: https://developers.google.com/identity/protocols/oauth2/service-account */
export async function getGoogleAccessToken(serviceAccount: ServiceAccount, scopes: string[]): Promise<string> {
  const key = await importPKCS8(serviceAccount.private_key, 'RS256')
  const now = Math.floor(Date.now() / 1000)

  const jwt = await new SignJWT({ scope: scopes.join(' ') })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(serviceAccount.client_email)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key)

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  const data = (await res.json()) as { access_token?: string; error?: string; error_description?: string }
  if (!data.access_token) {
    throw new Error(`Google token exchange failed: ${data.error ?? res.status} ${data.error_description ?? ''}`)
  }
  return data.access_token
}
