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
export interface SessionExercise {
  name: string
  sets: string
  note?: string
  // Structured numeric log, present only for split exercises logged via the Sets/Reps/Weight/RPE
  // grid in Tracker — powers the e1RM/volume graphs and RPE-vs-target comparison in Progress.
  raw?: { sets: number; reps: number; weightKg: number; rpe?: number }
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
