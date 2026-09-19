import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth, db, firebaseEnabled, watchAuth, watchForegroundPush } from '../lib/firebase'
import { DEFAULTS, loadLocal, saveLocal, type AppState } from './appState'

interface StoreCtx {
  state: AppState
  setState: (updater: AppState | ((prev: AppState) => AppState)) => void
  user: User | null
  authReady: boolean
  cloudEnabled: boolean
}

const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(() => loadLocal())
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(!firebaseEnabled)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auth
  useEffect(() => {
    const unsub = watchAuth((u) => {
      setUser(u)
      setAuthReady(true)
    })
    return unsub
  }, [])

  // Show a notification for push messages that arrive while the app is in the foreground
  useEffect(() => watchForegroundPush(), [])

  // Live cloud sync — a persistent listener (not a one-time fetch) so a change written from
  // elsewhere (another device, or the Worker's Sunday weekly-review job) reaches this open
  // session immediately instead of only on the next fresh app launch.
  //
  // onSnapshot also fires for our OWN writes echoing back once Firestore acknowledges them —
  // naively applying every event to local state would re-trigger the debounced write effect
  // below, which writes again, which echoes again, forever. The fix is a content-equality
  // check: `merged` and `prev` are both always built via the same `{...DEFAULTS, ...x}` spread
  // (see loadLocal below too), so they always land on the same canonical key order and a plain
  // JSON.stringify comparison is safe — when an echo's content matches what's already local,
  // the functional setStateRaw returns `prev` unchanged, so React keeps the same object
  // reference and nothing downstream re-fires. A genuine external change (different content)
  // still applies normally.
  useEffect(() => {
    if (!user || !db) return
    const ref = doc(db!, 'users', user.uid, 'state', 'app')
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setDoc(ref, state).catch(() => {})
        return
      }
      const merged = { ...structuredClone(DEFAULTS), ...(snap.data() as Partial<AppState>) }
      setStateRaw((prev) => {
        if (JSON.stringify(merged) === JSON.stringify(prev)) return prev
        saveLocal(merged) // keep the offline cache current too, e.g. a server-pushed weekly review
        return merged
      })
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const setState = useCallback((updater: AppState | ((prev: AppState) => AppState)) => {
    setStateRaw((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: AppState) => AppState)(prev) : updater
      saveLocal(next)
      return next
    })
  }, [])

  // Debounced cloud sync whenever state changes and we're signed in
  useEffect(() => {
    if (!user || !db) return
    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      const ref = doc(db!, 'users', user.uid, 'state', 'app')
      setDoc(ref, state, { merge: true }).catch(() => {})
    }, 800)
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current)
    }
  }, [state, user])

  return (
    <Ctx.Provider value={{ state, setState, user, authReady, cloudEnabled: firebaseEnabled }}>
      {children}
    </Ctx.Provider>
  )
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export { auth }
