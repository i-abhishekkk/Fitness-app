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
import {
  getMessaging,
  isSupported as isMessagingSupported,
  getToken,
  deleteToken,
  onMessage,
  type Messaging,
} from 'firebase/messaging'
import { firebaseConfig, firebaseEnabled } from './firebaseConfig'

export { firebaseEnabled }

let app: FirebaseApp | undefined
let auth: ReturnType<typeof getAuth> | undefined
let db: Firestore | undefined

if (firebaseEnabled) {
  app = initializeApp(firebaseConfig)
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

export type PushEnableResult = { token: string } | { error: 'unsupported' | 'denied' | 'no-vapid-key' }

/** Requests notification permission and returns an FCM registration token to store
 *  server-side. Safari only supports this for a PWA already added to the home screen —
 *  `isMessagingSupported()` returns false in a plain browser tab there. */
export async function enablePush(): Promise<PushEnableResult> {
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
  if (!app || !vapidKey) return { error: 'no-vapid-key' }
  if (!('Notification' in window) || !(await isMessagingSupported().catch(() => false))) {
    return { error: 'unsupported' }
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { error: 'denied' }

  const registration = await navigator.serviceWorker.ready
  const messaging = getMessaging(app)
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration })
  return { token }
}

export async function disablePush(): Promise<void> {
  if (!app) return
  if (!(await isMessagingSupported().catch(() => false))) return
  await deleteToken(getMessaging(app)).catch(() => {})
}

/** Foreground push messages don't auto-show a system notification (only background ones
 *  routed through the service worker do) — this shows one manually while the app is open. */
export function watchForegroundPush(): () => void {
  if (!app) return () => {}
  let messaging: Messaging | undefined
  let unsub = () => {}
  isMessagingSupported()
    .then((supported) => {
      if (!supported || !app) return
      messaging = getMessaging(app)
      unsub = onMessage(messaging, (payload) => {
        const title = payload.notification?.title ?? 'GOD MODE'
        const body = payload.notification?.body
        navigator.serviceWorker.ready.then((reg) => reg.showNotification(title, { body, icon: 'icons/icon-192.png' }))
      })
    })
    .catch(() => {})
  return () => unsub()
}
