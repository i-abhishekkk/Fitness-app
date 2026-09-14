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
export interface SessionEntry {
  id: string
  date: string
  dayType: string
  exercises: { name: string; sets: string; note?: string }[]
}

export interface AppState {
  water: number
  steps: number
  checklist: Record<string, boolean>
  supps: Record<string, boolean>
  sessions: SessionEntry[]
  weights: WeightEntry[]
  measurements: Record<string, number>[]
  sleep: { date: string; hours: number }[]
  food: unknown[]
  macros: { p: number; c: number; f: number; k: number }
  streakDays: string[]
  skillUnlocks: Record<string, 'locked' | 'current' | 'unlocked'>
  habits: Record<string, boolean>
  aura: AuraState
}

export const DEFAULTS: AppState = {
  water: 0,
  steps: 0,
  checklist: {},
  supps: {},
  sessions: [],
  weights: [],
  measurements: [],
  sleep: [],
  food: [],
  macros: { p: 0, c: 0, f: 0, k: 0 },
  streakDays: [],
  skillUnlocks: {},
  habits: {},
  aura: { hs: 0, mu: 0, pu: 0, cv: 0, hsRaw: 0, muRaw: 0, puRaw: 0, cvRaw: 0, c2bRaw: 0, scapRaw: 0 },
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
