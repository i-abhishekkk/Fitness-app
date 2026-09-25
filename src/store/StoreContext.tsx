import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth, db, firebaseEnabled, watchAuth, watchForegroundPush } from '../lib/firebase'
import { DEFAULTS, loadLocal, saveLocal, mergeAppState, getLogicalDateKey, resetDailyFields, type AppState } from './appState'

const RESET_CHECK_INTERVAL_MS = 5 * 60 * 1000

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

  // Daily auto-reset — water, steps, today's checklist, supplement toggles, habits, and the
  // running macro counter all zero out at 3 AM local time (see getLogicalDateKey) instead of
  // requiring the manual "Reset" buttons. Runs on mount (the common case: a fresh app open the
  // next day) and every few minutes after that in case the app is ever left open across the
  // 3 AM boundary. Pure local-state check, no network/auth dependency, so it works offline too.
  useEffect(() => {
    const checkReset = () => {
      const today = getLogicalDateKey()
      setStateRaw((prev) => {
        if (prev.lastResetDate === today) return prev
        const next = resetDailyFields(prev, today)
        saveLocal(next)
        return next
      })
    }
    checkReset()
    const interval = setInterval(checkReset, RESET_CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // Live cloud sync — a persistent listener (not a one-time fetch) so a change written from
  // elsewhere (another device, or the Worker's Sunday weekly-review job) reaches this open
  // session immediately instead of only on the next fresh app launch.
  //
  // Uses mergeAppState rather than a blind overwrite — see its doc comment in appState.ts.
  // In short: a plain "cloud replaces local" apply is lossy whenever local has a change the
  // cloud hasn't caught up on yet (closed the tab before the debounced write landed, was
  // offline, etc.) — exactly what caused a saved session to vanish the next day. Merging by
  // identity means a real external change (or our own write echoing back) still applies
  // normally, but nothing gets silently dropped either way.
  //
  // The content-equality check below is what stops the echo-loop: onSnapshot also fires for
  // our OWN writes once Firestore acknowledges them, and naively applying every event would
  // re-trigger the debounced write effect, which writes again, which echoes again, forever.
  // `merged` and `prev` are always built through the same canonical field order (mergeAppState
  // spreads DEFAULTS-shaped objects), so a plain JSON.stringify comparison is safe — when an
  // echo's content matches what's already local, returning `prev` keeps the same object
  // reference and nothing downstream re-fires.
  useEffect(() => {
    if (!user || !db) return
    const ref = doc(db!, 'users', user.uid, 'state', 'app')
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setDoc(ref, state).catch((err) => console.error('Initial cloud write failed:', err))
        return
      }
      const cloud = { ...structuredClone(DEFAULTS), ...(snap.data() as Partial<AppState>) }
      setStateRaw((prev) => {
        const merged = mergeAppState(prev, cloud)
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
      setDoc(ref, state, { merge: true }).catch((err) => console.error('Cloud sync failed:', err))
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
