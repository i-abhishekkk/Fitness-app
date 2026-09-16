import type { AppState } from '../store/appState'
import { AURA_TARGETS, DIET_TARGETS, HABITS, SKILL_UNLOCKS, WATER_TARGET_L, STEPS_TARGET, WEIGHT_BASELINE, WEIGHT_TARGET, calcAge, getTodayCfg } from '../data/plan'
import { LAWS } from '../data/workouts'

/** Turns the live app state + the program's static rules into one grounded text block
 *  for the coach system prompt. Only ever reports what's actually in `state` — no
 *  invented trends or numbers — so the model has nothing to hallucinate on top of. */
export function buildCoachContext(state: AppState): string {
  const cfg = getTodayCfg()
  const targets = DIET_TARGETS[cfg.type]
  const weight = state.weights.at(-1)?.kg ?? WEIGHT_BASELINE
  const prevWeight = state.weights.length >= 2 ? state.weights[state.weights.length - 2].kg : null
  const recentWeights = state.weights
    .slice(-10)
    .map((w) => `${new Date(w.date).toLocaleDateString()}: ${w.kg}kg`)
    .join('; ')

  const a = state.aura
  const auraLines = [
    `Handstand hold: ${a.hsRaw}s (target ${AURA_TARGETS.hs}s, ${Math.round((a.hsRaw / AURA_TARGETS.hs) * 100)}%)`,
    `Pull-ups: ${a.puRaw} reps (target ${AURA_TARGETS.pu}, ${Math.round((a.puRaw / AURA_TARGETS.pu) * 100)}%)`,
    `Dips/muscle-up prep: ${a.muRaw} reps (target ${AURA_TARGETS.mu}, ${Math.round((a.muRaw / AURA_TARGETS.mu) * 100)}%)`,
    `Cardio (stair sets): ${a.cvRaw} sets (target ${AURA_TARGETS.cv}, ${Math.round((a.cvRaw / AURA_TARGETS.cv) * 100)}%)`,
    `C2B pull-ups: ${a.c2bRaw} reps`,
    `Scapular pull-ups: ${a.scapRaw} reps`,
  ]

  const recentSessions = state.sessions
    .slice(0, 8)
    .map((s) => {
      const ex = s.exercises.map((e) => `${e.name} ${e.sets}`).join(', ')
      return `${new Date(s.date).toLocaleDateString()} (${s.dayType}): ${ex || 'no exercises logged'}`
    })
    .join('\n')

  const last7Sleep = state.sleep.slice(-7)
  const sleepAvg = last7Sleep.length ? (last7Sleep.reduce((sum, s) => sum + s.hours, 0) / last7Sleep.length).toFixed(1) : 'no data'
  const sleepList = last7Sleep.map((s) => `${new Date(s.date).toLocaleDateString()}: ${s.hours}h`).join('; ')

  const habitsToday = HABITS.map((h) => `${h.name}: ${state.habits[h.key] ? 'done' : 'not done'}`).join('; ')

  const skillUnlocks = SKILL_UNLOCKS.map((s) => `${s.name} (${s.week}): ${state.skillUnlocks[s.key] ?? 'locked'}`).join('; ')

  const streak = state.streakDays.length
  const sortedStreak = [...state.streakDays].sort()
  const lastStreakDay = sortedStreak.at(-1) ?? 'none logged'

  const laws = LAWS.map((l) => `${l.n}. ${l.text}`).join('\n')

  return `PROGRAM PHILOSOPHY (the "12 Laws of God Mode" — Abhishek's own training rules):
${laws}

TODAY: ${cfg.label} (${new Date().toLocaleDateString()}). Diet targets today: ${targets.kcal} kcal, ${targets.p}g protein, ${targets.c}g carbs, ${targets.f}g fat.

WEIGHT: current ${weight}kg (baseline ${WEIGHT_BASELINE}kg, target ${WEIGHT_TARGET}kg)${prevWeight ? `, previous entry ${prevWeight}kg` : ''}.
Recent weigh-ins: ${recentWeights || 'none logged'}.

SKILL PROGRESS (Aura):
${auraLines.join('\n')}

TODAY'S LOGGED INTAKE: ${state.macros.p}g protein, ${state.macros.c}g carbs, ${state.macros.f}g fat, ${state.macros.k} kcal (vs targets above).
HYDRATION TODAY: ${((state.water * 250) / 1000).toFixed(2)}L of ${WATER_TARGET_L}L target.
STEPS TODAY: ${state.steps} of ${STEPS_TARGET} target.

STREAK: current streak ${streak} days total logged, most recent logged day ${lastStreakDay}.

SLEEP (last 7 nights): average ${sleepAvg}h. Detail: ${sleepList || 'no data'}.

TODAY'S HABITS: ${habitsToday}.

SKILL UNLOCK TRACKER: ${skillUnlocks}.

RECENT WORKOUT SESSIONS (most recent first):
${recentSessions || 'no sessions logged yet'}

Abhishek's age: ${calcAge()}.`
}
