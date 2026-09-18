// Ported 1:1 from legacy/Abhishek_GodMode_Hub_v7.html — source of truth for the training/diet plan.
// Schedule updated 2026-09-18: gym shifted to 8:30 AM, office 11:00 AM–5:00 PM (15 min
// commute), meals consolidated from 6-7/day to 4/day to fit around the office block.

export type DayType = 'pull' | 'push' | 'legs' | 'sat' | 'rest'
export const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const
export type Dow = (typeof DOW)[number]

export const DOB = new Date(1998, 11, 10) // 10 Dec 1998
export function calcAge(): number {
  const today = new Date()
  let age = today.getFullYear() - DOB.getFullYear()
  const m = today.getMonth() - DOB.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < DOB.getDate())) age--
  return age
}
export function getHRMax(): number {
  return 220 - calcAge()
}

export const WEIGHT_BASELINE = 65.0
export const WEIGHT_TARGET = 76.0

export interface DayCfg {
  label: string
  color: string
  type: DayType
  kcal: number
}

export const DAY_CFG: Record<Dow, DayCfg> = {
  MON: { label: 'Pull Day A', color: 'var(--color-blue)', type: 'pull', kcal: 3500 },
  TUE: { label: 'Push Day A', color: 'var(--color-amber)', type: 'push', kcal: 3350 },
  WED: { label: 'Leg Day', color: 'var(--color-accent)', type: 'legs', kcal: 3900 },
  THU: { label: 'Pull Day B', color: 'var(--color-teal)', type: 'pull', kcal: 3500 },
  FRI: { label: 'Push Day B', color: 'var(--color-green)', type: 'push', kcal: 3350 },
  SAT: { label: 'HS + Park Legs', color: 'var(--color-purple)', type: 'sat', kcal: 3600 },
  SUN: { label: 'Sacred Recovery', color: 'var(--color-text-3)', type: 'rest', kcal: 2650 },
}

export function getTodayDow(): Dow {
  return DOW[new Date().getDay()] as Dow
}
export function getTodayCfg(): DayCfg {
  return DAY_CFG[getTodayDow()]
}

export interface MacroTarget {
  kcal: number
  p: number
  c: number
  f: number
}
export const DIET_TARGETS: Record<DayType, MacroTarget> = {
  pull: { kcal: 3500, p: 172, c: 460, f: 109 },
  push: { kcal: 3350, p: 171, c: 464, f: 88 },
  legs: { kcal: 3900, p: 201, c: 492, f: 116 },
  sat: { kcal: 3600, p: 187, c: 466, f: 108 },
  rest: { kcal: 2650, p: 147, c: 376, f: 86 },
}

export interface ChecklistItem {
  id: string
  text: string
  sub: string
}
export const CHECKLISTS: Record<DayType, ChecklistItem[]> = {
  pull: [
    { id: 'wrist-up', text: 'Wrist warm-up done', sub: '3 min · before skill block 6:45 AM' },
    { id: 'hs-skill', text: 'Handstand skill session', sub: '20 min · kick-ups + wall holds' },
    { id: 'gym', text: 'Pull Day gym session done', sub: '8:30 AM · back, biceps, forearms' },
    { id: 'zone2', text: 'Zone 2 walk done', sub: '15 min, evening after office · 10-12% incline' },
    { id: 'm2', text: 'Meal 2 within 45 min post-gym', sub: 'Air-fried eggs + oat shake + sattu · Creatine 5g' },
    { id: 'creatine', text: 'Creatine 5g with Meal 2', sub: 'With carbs post-workout' },
    { id: 'water', text: '4.5L water hit', sub: 'Track on Today tab' },
    { id: 'steps', text: '8,000+ steps done', sub: 'Zone 2 baseline' },
    { id: 'office', text: 'Reached office by 11:00 AM', sub: '15 min commute — leave by 10:40 AM' },
    { id: 'sleep', text: 'Screens off by 11:00 PM', sub: 'Sleep by 11:15 PM → 7h before 6:15 AM wake' },
  ],
  push: [
    { id: 'gym', text: 'Push Day gym session done', sub: '8:30 AM · chest, shoulders, triceps' },
    { id: 'hiit', text: 'HIIT finisher done', sub: '6 rounds · 60s on / 60s off' },
    { id: 'm2', text: 'Meal 2 within 45 min post-gym', sub: 'Air-fried eggs + oat shake + sattu · never skip' },
    { id: 'water', text: '4.5L water hit', sub: 'Track on Today tab' },
    { id: 'steps', text: '8,000+ steps done', sub: 'Zone 2 baseline' },
    { id: 'no-wrists', text: 'No wrist loading today', sub: 'Wrists resting for Saturday HS' },
    { id: 'office', text: 'Reached office by 11:00 AM', sub: '15 min commute — leave by 10:40 AM' },
    { id: 'sleep', text: 'Screens off by 11:00 PM', sub: 'Sleep by 11:15 PM → 7h before 6:15 AM wake' },
  ],
  legs: [
    { id: 'gym', text: 'Leg Day gym session done', sub: '8:30 AM · squats + deadlifts + hams' },
    { id: 'wrist-work', text: 'Wrist specialist work done', sub: '6:45 AM skill block · WED only' },
    { id: 'm2', text: 'Meal 2 within 45 min post-gym', sub: '90g oats + eggs + sattu · Creatine 5g' },
    { id: 'creatine', text: 'Creatine 5g with Meal 2', sub: 'With oat shake post-workout' },
    { id: 'extra-carb', text: 'Extra rice at Meal 3 (200g)', sub: 'Chicken lunch today · 50g more rice than normal' },
    { id: 'water', text: '4.5L water hit', sub: 'Hydration critical for heavy lifting' },
    { id: 'steps', text: '8,000+ steps done', sub: 'Zone 2 baseline' },
    { id: 'office', text: 'Reached office by 11:00 AM', sub: 'Heaviest day — leave prep on time, 10:40 AM' },
    { id: 'sleep', text: 'Screens off by 11:00 PM', sub: 'Sleep by 11:15 PM → 7h before 6:15 AM wake' },
  ],
  sat: [
    { id: 'hs-home', text: 'Saturday HS home session', sub: '6:40 AM · 25 min · crown jewel session' },
    { id: 'park', text: 'Park legs session done', sub: '10:00 AM · explosive + HIIT' },
    { id: 'm1-after', text: 'Meal 1 after HS (not before)', sub: 'Fasted HS = sharper nervous system' },
    { id: 'm2', text: 'Meal 2 post-park session', sub: '12:00 PM · 4 whole eggs air-fried + 90g oats · 954 kcal' },
    { id: 'water', text: '4.5L water hit', sub: 'Double session = double sweat' },
    { id: 'sleep', text: 'Sleep by 11:00 PM', sub: 'Two sessions = extra recovery needed' },
  ],
  rest: [
    { id: 'walk', text: '20–30 min easy walk', sub: 'Outdoors, no heart rate goal' },
    { id: 'stretch', text: 'Full body stretch done', sub: '15 min · 30s per muscle' },
    { id: 'foam', text: 'Foam rolling done', sub: '10 min · quads, lats, thoracic' },
    { id: 'no-heavy', text: 'Zero heavy training today', sub: 'Rest IS training. Non-negotiable.' },
    { id: 'sleep', text: 'Sleep 8+ hours tonight', sub: 'GH peaks in deep sleep' },
    { id: 'water', text: '3.5L water hit', sub: 'Rest day hydration' },
  ],
}

export type TimelineType = 'work' | 'meal' | 'skill' | 'gym' | 'sleep'
export interface TimelineEvent {
  t: string
  label: string
  type: TimelineType
  note: string
}
export const TIMELINES: Record<DayType, TimelineEvent[]> = {
  pull: [
    { t: '6:15 AM', label: 'Wake up', type: 'work', note: 'Dry fruits soaked from 12 AM — ready to eat' },
    { t: '6:20 AM', label: 'Meal 1 — Pre-workout', type: 'meal', note: '2 bananas + soaked dry fruits · 469 kcal' },
    { t: '6:45 AM', label: 'HS Skill Block', type: 'skill', note: 'Wrist warm-up → hollow body → wall holds → kick-ups · 20 min' },
    { t: '8:30 AM', label: 'Gym — Pull Day A', type: 'gym', note: 'Scap primer → back width + biceps + forearms + core' },
    { t: '9:45 AM', label: 'Meal 2 — POST-WORKOUT ⚡', type: 'meal', note: 'Air-fried egg bites + oat shake + sattu/moong · Creatine 5g · 1060 kcal' },
    { t: '10:00 AM', label: 'Shower + prep', type: 'work', note: 'Quick turnaround — leaving for office at 10:40' },
    { t: '10:40 AM', label: 'Leave for office', type: 'work', note: '15 min commute' },
    { t: '11:00 AM', label: 'Office starts', type: 'work', note: 'Until 5:00 PM' },
    { t: '1:30 PM', label: 'Meal 3 — Lunch', type: 'meal', note: 'Soya tandoori + rice + dal + curd + bulk shake · 999 kcal' },
    { t: '5:00 PM', label: 'Office ends', type: 'work', note: 'Head home — 15 min commute' },
    { t: '6:00 PM', label: 'Zone 2 walk', type: 'gym', note: '15 min incline · 10–12% grade · HR 130–145' },
    { t: '7:30 PM', label: 'Meal 4 — Dinner', type: 'meal', note: 'Paneer air-fried + dal + rice + rotis + sabzi + warm milk · 975 kcal' },
    { t: '9:00 PM', label: 'Stream / wind-down', type: 'work', note: 'Setup + content · plan before going live' },
    { t: '11:00 PM', label: 'Screens off', type: 'sleep', note: 'Blue light blocks melatonin production' },
    { t: '11:15 PM', label: 'Sleep', type: 'sleep', note: '7 hours → 6:15 AM wake' },
  ],
  push: [
    { t: '6:15 AM', label: 'Wake up', type: 'work', note: 'No HS skill today — wrists resting for Saturday' },
    { t: '6:20 AM', label: 'Meal 1 — Pre-workout', type: 'meal', note: '2 bananas + soaked dry fruits · 469 kcal' },
    { t: '6:45 AM', label: 'Mobility / rest block', type: 'skill', note: 'Light stretch — no wrist loading today' },
    { t: '8:30 AM', label: 'Gym — Push Day A', type: 'gym', note: 'Rear delt primer → chest + shoulders + triceps → HIIT finisher' },
    { t: '9:45 AM', label: 'Meal 2 — POST-WORKOUT ⚡', type: 'meal', note: 'Air-fried egg bites + oat shake + sattu/moong · anabolic window · 1060 kcal' },
    { t: '10:00 AM', label: 'Shower + prep', type: 'work', note: 'Quick turnaround — leaving for office at 10:40' },
    { t: '10:40 AM', label: 'Leave for office', type: 'work', note: '15 min commute' },
    { t: '11:00 AM', label: 'Office starts', type: 'work', note: 'Until 5:00 PM' },
    { t: '1:30 PM', label: 'Meal 3 — Lunch', type: 'meal', note: 'Soya tandoori + rice + dal + curd + bulk shake · 999 kcal' },
    { t: '5:00 PM', label: 'Office ends', type: 'work', note: 'Head home — 15 min commute' },
    { t: '7:30 PM', label: 'Meal 4 — Dinner', type: 'meal', note: 'Air-fried soya + dal + rice + rotis + sabzi + warm milk · 806 kcal' },
    { t: '9:00 PM', label: 'Stream', type: 'work', note: 'Content block' },
    { t: '11:00 PM', label: 'Screens off', type: 'sleep', note: 'Pre-sleep routine' },
    { t: '11:15 PM', label: 'Sleep', type: 'sleep', note: '7 hours → 6:15 AM wake' },
  ],
  legs: [
    { t: '6:15 AM', label: 'Wake up — Leg Day', type: 'work', note: 'Heaviest session of the week. Extra date in Meal 1.' },
    { t: '6:20 AM', label: 'Meal 1 — Carb-loaded pre-workout', type: 'meal', note: 'Bananas + dry fruits + 1 extra khajur · 531 kcal' },
    { t: '6:45 AM', label: 'Wrist Specialist Work', type: 'skill', note: 'Plate pinch + wrist roller · WED only · HS fingertip strength' },
    { t: '8:30 AM', label: 'Gym — Leg Day HEAVY', type: 'gym', note: 'Squats 5×5 → leg press → RDL → ham curl → hip thrust' },
    { t: '9:45 AM', label: 'Meal 2 — BIGGEST OF THE WEEK ⚡', type: 'meal', note: 'Air-fried eggs + 90g oats + sattu/moong · Creatine 5g · 1098 kcal' },
    { t: '10:00 AM', label: 'Shower + prep', type: 'work', note: 'Quick turnaround — leaving for office at 10:40' },
    { t: '10:40 AM', label: 'Leave for office', type: 'work', note: '15 min commute' },
    { t: '11:00 AM', label: 'Office starts', type: 'work', note: 'Until 5:00 PM' },
    { t: '1:30 PM', label: 'Meal 3 — BOOSTED Lunch', type: 'meal', note: 'Tandoori chicken + 200g rice + dal + curd + bulk shake · 1278 kcal' },
    { t: '5:00 PM', label: 'Office ends', type: 'work', note: 'Head home — 15 min commute' },
    { t: '7:30 PM', label: 'Meal 4 — Dinner', type: 'meal', note: 'Paneer air-fried + dal + rice + rotis + sabzi + warm milk · 975 kcal' },
    { t: '9:00 PM', label: 'Stream', type: 'work', note: 'Content block' },
    { t: '11:00 PM', label: 'Screens off', type: 'sleep', note: 'Legs need max recovery' },
    { t: '11:15 PM', label: 'Sleep', type: 'sleep', note: '7 hours → 6:15 AM wake' },
  ],
  sat: [
    { t: '6:15 AM', label: 'Wake — DO NOT EAT YET', type: 'work', note: 'Fasted HS = sharper nervous system signal' },
    { t: '6:40 AM', label: 'Home HS Session ⭐', type: 'skill', note: 'Crown jewel of the week · 25 min · best kick-ups happen here' },
    { t: '7:30 AM', label: 'Meal 1 — Post-HS breakfast', type: 'meal', note: '2 bananas + soaked dry fruits · 469 kcal · first food of the day' },
    { t: '8:30 AM', label: 'Rest + hydrate for park', type: 'work', note: 'Chill, drink water, mentally prepare' },
    { t: '10:00 AM', label: 'Park — Legs + HIIT', type: 'gym', note: 'Split squats → jump squats → GHR/Superman → stair sprints' },
    { t: '12:00 PM', label: 'Meal 2 — Post-park recovery', type: 'meal', note: '4 whole eggs (air-fried) + 90g oats + 300ml milk · 954 kcal' },
    { t: '2:30 PM', label: 'Meal 3', type: 'meal', note: 'Sattu/moong + tandoori chicken · Creatine 5g · 922 kcal' },
    { t: '7:30 PM', label: 'Meal 4', type: 'meal', note: 'Bulk shake + paneer dinner · 1298 kcal' },
    { t: '9:00 PM', label: 'Stream (light)', type: 'work', note: 'Content block — keep it easy, two sessions today' },
    { t: '11:00 PM', label: 'Sleep early tonight', type: 'sleep', note: 'Two sessions. More recovery needed.' },
  ],
  rest: [
    { t: '8:30 AM', label: 'Natural wake-up', type: 'work', note: 'No alarm. Let the body rest.' },
    { t: '9:15 AM', label: 'Meal 1 — Relaxed morning', type: 'meal', note: 'Bananas + dry fruits · 469 kcal · chill start' },
    { t: '10:00 AM', label: 'Light walk outdoors', type: 'gym', note: '20–30 min · easy pace · just sunlight and movement' },
    { t: '10:30 AM', label: 'Meal 2 — Breakfast', type: 'meal', note: 'Air-fried eggs + oat shake · 866 kcal · synthesis still running from Saturday' },
    { t: '11:30 AM', label: 'Stretch + foam roll', type: 'skill', note: '15 min stretch + 10 min foam rolling' },
    { t: '1:30 PM', label: 'Meal 3', type: 'meal', note: 'Sattu/moong + reduced soya lunch · 512 kcal' },
    { t: '8:30 PM', label: 'Meal 4 — Dinner', type: 'meal', note: 'Paneer air-fried dinner + warm milk · 975 kcal' },
    { t: '9:00 PM', label: 'Light evening', type: 'work', note: 'No intense content · chill stream or prep' },
    { t: '11:00 PM', label: 'Sleep early', type: 'sleep', note: 'Aim 11 PM tonight · maximum GH release window' },
  ],
}

export interface Supp {
  key: string
  name: string
  dose: string
  timing: string
  days: string
  color: string
}
export const SUPPS: Supp[] = [
  { key: 'collagen', name: 'Collagen Peptides', dose: '10g', timing: '8:00 AM · 30 min before gym', days: 'Daily', color: 'var(--color-amber)' },
  { key: 'creatine', name: 'Creatine Monohydrate', dose: '5g', timing: '8:15 AM · on your way to gym', days: 'Training days', color: 'var(--color-blue)' },
  { key: 'multivitamin', name: 'Multivitamin', dose: '1 tablet', timing: '10:00 AM · right after post-workout meal', days: 'Daily', color: 'var(--color-teal)' },
  { key: 'omega', name: 'Omega-3 Fish Oil', dose: '1–2g EPA+DHA', timing: '10:00 AM · right after post-workout meal', days: 'Daily', color: 'var(--color-green)' },
  { key: 'b12', name: 'Vitamin B12', dose: '1000mcg methylcobalamin', timing: '2:00 PM · after afternoon meal', days: 'Daily', color: 'var(--color-accent)' },
  { key: 'zma', name: 'Magnesium (ZMA)', dose: '25mg Zn + 200mg Mg', timing: '10:30 PM · 30 min before sleep', days: 'Daily', color: 'var(--color-purple)' },
  { key: 'd3', name: 'Vitamin D3 + K2', dose: '2000–4000 IU', timing: '2:15 PM · Sunday, post-lunch', days: 'Weekly (Sunday)', color: 'var(--color-amber)' },
]

export interface Habit {
  key: string
  name: string
  icon: string
  sub: string
}
export const HABITS: Habit[] = [
  { key: 'dryfruit', name: 'Dry fruits soaked', icon: '🥜', sub: 'Before 12 AM for next morning Meal 1' },
  { key: 'wrist-wu', name: 'Wrist warm-up done', icon: '🤲', sub: 'Every training day — non-negotiable' },
  { key: 'no-phone', name: 'No phone in bed', icon: '📵', sub: 'Screens off by 11:00 PM' },
  { key: 'posture', name: 'Posture check (3×)', icon: '🧍', sub: 'Hollow body alignment awareness' },
  { key: 'notes', name: 'Session notes written', icon: '📓', sub: 'Log on Tracker tab after training' },
  { key: 'stream-p', name: 'Stream content planned', icon: '🎮', sub: 'Plan before 8 PM — not during' },
]

export interface SkillUnlock {
  key: string
  icon: string
  name: string
  week: string
}
export const SKILL_UNLOCKS: SkillUnlock[] = [
  { key: 'hollow30', icon: '🤲', name: 'Hollow Body — 30s hold', week: 'Week 2–3 target' },
  { key: 'wall-hs30', icon: '🤸', name: 'Wall Handstand — 30s hold', week: 'Week 4–6 target' },
  { key: 'pullup10', icon: '💪', name: '10 Clean Pull-ups', week: 'Week 5–8 target' },
  { key: 'hs10', icon: '🏋️', name: 'Freestanding HS — 10s hold', week: 'Month 3–4 target' },
  { key: 'muscup1', icon: '⚡', name: 'First Muscle-up', week: 'Month 3–5 target' },
  { key: 'hspu', icon: '🔥', name: 'Wall Handstand Push-up', week: 'Month 4–6 target' },
  { key: 'muscup-s', icon: '👑', name: 'Strict Muscle-up + Freestanding HS', week: 'Month 6–8 target' },
]

export const AURA_TARGETS = { hs: 60, mu: 15, pu: 15, cv: 10 }
export const WATER_TARGET_L = 4.5
export const STEPS_TARGET = 8000

export const OFFICE = { start: '11:00 AM', end: '5:00 PM', commuteMinutes: 15 }
