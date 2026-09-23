export interface AuraState {
  hs: number
  mu: number
  pu: number
  cv: number
  hsRaw: number
  muRaw: number
  puRaw: number
  cvRaw: number
  c2bRaw: number
  scapRaw: number
}

export interface WeightEntry {
  date: string // ISO
  kg: number
}
// One row per individual set — different weight/reps/RPE per set (e.g. a pyramid or
// top-set-then-backoff) is the normal case, not the exception, so this is an array rather
// than a single aggregate {sets,reps,weight}.
export interface SetLog {
  reps: number
  weightKg: number
  rpe?: number
}
export interface SessionExercise {
  name: string
  sets: string
  note?: string
  // Structured numeric log, present only for split exercises logged via the per-set grid in
  // Tracker — powers the e1RM/volume graphs and RPE-vs-target comparison in Progress.
  raw?: SetLog[]
}
export interface SessionEntry {
  id: string
  date: string
  dayType: string
  exercises: SessionExercise[]
}
export interface MeasurementEntry {
  date: string // ISO
  chest?: number
  waist?: number
  hips?: number
  arms?: number
  thighs?: number
  neck?: number
}
export interface FoodEntry {
  id: string
  date: string // ISO
  name: string
  p: number
  c: number
  f: number
  k: number
}
// Everything logged outside a workout session — water, steps, supplements, checklist items,
// habits — combined into one timestamped feed for History > Activity. Food entries already
// have their own dated array (below) and are merged into that same view by date, not
// duplicated in here.
export interface ActivityEntry {
  id: string
  date: string // ISO
  icon: string
  label: string
}

export interface AppState {
  water: number
  steps: number
  checklist: Record<string, boolean>
  supps: Record<string, boolean>
  sessions: SessionEntry[]
  weights: WeightEntry[]
  measurements: MeasurementEntry[]
  heightCm: number | null
  sleep: { date: string; hours: number }[]
  food: FoodEntry[]
  macros: { p: number; c: number; f: number; k: number }
  activityLog: ActivityEntry[]
  streakDays: string[]
  skillUnlocks: Record<string, 'locked' | 'current' | 'unlocked'>
  habits: Record<string, boolean>
  aura: AuraState
  push: { enabled: boolean; token: string | null }
  // Written server-side by the Worker's Sunday cron job — see worker/src/reminders.ts's
  // generateWeeklyReview. Only picked up client-side on the next fresh sign-in load (same
  // limitation as the `push` field above), not live-synced.
  weeklyReview: { text: string; generatedAt: string } | null
}

export const DEFAULTS: AppState = {
  water: 0,
  steps: 0,
  checklist: {},
  supps: {},
  sessions: [],
  weights: [],
  measurements: [],
  heightCm: null,
  sleep: [],
  food: [],
  macros: { p: 0, c: 0, f: 0, k: 0 },
  activityLog: [],
  streakDays: [],
  skillUnlocks: {},
  habits: {},
  aura: { hs: 0, mu: 0, pu: 0, cv: 0, hsRaw: 0, muRaw: 0, puRaw: 0, cvRaw: 0, c2bRaw: 0, scapRaw: 0 },
  push: { enabled: false, token: null },
  weeklyReview: null,
}

const STORAGE_KEY = 'gm5'

export function loadLocal(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULTS)
    return { ...structuredClone(DEFAULTS), ...JSON.parse(raw) }
  } catch {
    return structuredClone(DEFAULTS)
  }
}

export function saveLocal(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage full or unavailable — silently ignore, in-memory state still works
  }
}

type SetStateFn = (updater: AppState | ((prev: AppState) => AppState)) => void

/** Appends one entry to the combined Activity feed (History > Activity) — water, steps,
 *  supplements, checklist items, habits. Newest-first, so entries prepend rather than push. */
export function pushActivity(setState: SetStateFn, icon: string, label: string) {
  setState((s) => ({
    ...s,
    activityLog: [{ id: crypto.randomUUID(), date: new Date().toISOString(), icon, label }, ...s.activityLog],
  }))
}

// `order` must match how each field is conventionally stored elsewhere in the app: sessions
// and activityLog are always prepended (newest-first — WorkoutHistory and buildCoachContext's
// recentSessions both read the array directly, no re-sort), while food is appended
// (oldest-first, like weights/sleep/measurements below). Sorting sessions ascending here was
// the actual cause of a saved session appearing to "vanish" — it hadn't, it just got sorted to
// the bottom of a list nobody scrolled to the end of.
function dedupeById<T extends { id: string }>(a: T[], b: T[], order: 'asc' | 'desc' = 'asc'): T[] {
  const map = new Map<string, T>()
  for (const x of a) map.set(x.id, x)
  for (const x of b) if (!map.has(x.id)) map.set(x.id, x)
  const sign = order === 'asc' ? 1 : -1
  return Array.from(map.values()).sort(
    (x, y) => sign * (new Date((x as unknown as { date: string }).date).getTime() - new Date((y as unknown as { date: string }).date).getTime()),
  )
}
function dedupeByValue<T extends { date: string }>(a: T[], b: T[]): T[] {
  const seen = new Set(a.map((x) => JSON.stringify(x)))
  const out = [...a]
  for (const x of b) {
    const k = JSON.stringify(x)
    if (!seen.has(k)) {
      out.push(x)
      seen.add(k)
    }
  }
  return out.sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime())
}

/** Union-merges two AppStates rather than letting one side wholesale-replace the other.
 *  A plain "cloud overwrites local" sync is lossy: if a session was saved locally but the
 *  network write hadn't landed yet — tab closed, phone went offline, app backgrounded before
 *  the debounce fired — the next load's cloud snapshot doesn't have it, and overwriting local
 *  with that stale snapshot silently discards a real, saved log. Merging every list-of-records
 *  field by identity means an entry only ever gets ADDED across a sync, never dropped just
 *  because one side hadn't caught up yet — the union self-heals the missing side on the next
 *  write. The only way to actually remove something stays the explicit delete buttons in the
 *  UI, which edit whichever side is live and sync forward normally.
 *
 *  Trade-off worth knowing: because deletions aren't tracked as tombstones, a delete that lands
 *  in the ~800ms window right before an unrelated incoming snapshot could theoretically get
 *  re-added by the union. For a single-user app with occasional cross-device sync (not
 *  concurrent live editing), silently losing new data is the far more damaging failure mode,
 *  so this trades a rare, low-stakes "deleted thing reappeared, delete it again" for never
 *  losing a freshly logged session again. */
export function mergeAppState(a: AppState, b: AppState): AppState {
  return {
    ...b,
    ...a, // local scalars/maps (today's water, checklist, habits, etc.) take precedence
    sessions: dedupeById(a.sessions, b.sessions, 'desc'),
    food: dedupeById(a.food, b.food),
    activityLog: dedupeById(a.activityLog, b.activityLog, 'desc'),
    weights: dedupeByValue(a.weights, b.weights),
    sleep: dedupeByValue(a.sleep, b.sleep),
    measurements: dedupeByValue(a.measurements, b.measurements),
    streakDays: Array.from(new Set([...a.streakDays, ...b.streakDays])).sort(),
    weeklyReview:
      a.weeklyReview && b.weeklyReview
        ? new Date(a.weeklyReview.generatedAt) > new Date(b.weeklyReview.generatedAt)
          ? a.weeklyReview
          : b.weeklyReview
        : (a.weeklyReview ?? b.weeklyReview),
  }
}
