import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, firebaseEnabled, watchAuth } from '../lib/firebase'
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
  const hydratedFromCloud = useRef(false)

  // Auth
  useEffect(() => {
    const unsub = watchAuth((u) => {
      setUser(u)
      setAuthReady(true)
    })
    return unsub
  }, [])

  // Pull cloud state once per sign-in
  useEffect(() => {
    if (!user || !db || hydratedFromCloud.current) return
    hydratedFromCloud.current = true
    ;(async () => {
      const ref = doc(db!, 'users', user.uid, 'state', 'app')
      const snap = await getDoc(ref)
      if (snap.exists()) {
        setStateRaw({ ...structuredClone(DEFAULTS), ...(snap.data() as Partial<AppState>) })
      } else {
        await setDoc(ref, state)
      }
    })()
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
