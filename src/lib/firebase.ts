import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  type Firestore,
} from 'firebase/firestore'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Firebase is optional at build time — until real config is supplied (via .env.local
// locally, or repo secrets in CI) the app runs fully offline on localStorage only.
export const firebaseEnabled = Boolean(cfg.apiKey && cfg.projectId)

let app: FirebaseApp | undefined
let auth: ReturnType<typeof getAuth> | undefined
let db: Firestore | undefined

if (firebaseEnabled) {
  app = initializeApp(cfg)
  auth = getAuth(app)
  // Persistent local cache — writes made while offline (or a flaky gym wifi) queue in
  // IndexedDB and flush automatically once connectivity returns, instead of the silent
  // `.catch(() => {})` drop the debounced sync in StoreContext would otherwise hit.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({}) }),
  })
}

export { app, auth, db }

export function watchAuth(cb: (user: User | null) => void): () => void {
  if (!auth) {
    cb(null)
    return () => {}
  }
  return onAuthStateChanged(auth, cb)
}

export async function signInWithGoogle(): Promise<void> {
  if (!auth) return
  await signInWithPopup(auth, new GoogleAuthProvider())
}

export async function signOut(): Promise<void> {
  if (!auth) return
  await fbSignOut(auth)
}
