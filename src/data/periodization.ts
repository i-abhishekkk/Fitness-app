// 4-week undulating mesocycle — the same structure real hypertrophy coaching (Renaissance
// Periodization, block periodization literature) uses: 2 accumulation weeks build volume,
// week 3 peaks intensity (where PRs happen), week 4 deloads so week 1 of the next cycle
// starts fresh instead of grinding into a wall. Exercises themselves stay fixed (SPLIT in
// workouts.ts) — periodization only changes how you execute them: reps, load, rest, RPE.

export interface MesoWeek {
  week: 1 | 2 | 3 | 4
  name: string
  focus: string
  repGuidance: string
  restGuidance: string
  rpeTarget: string
  loadNote: string
  color: string
}

export const MESOCYCLE: MesoWeek[] = [
  {
    week: 1,
    name: 'Accumulation A',
    focus: 'Rebuild volume, groove technique after the deload',
    repGuidance: '8–12 reps compounds · 12–15 isolation',
    restGuidance: '90s compounds · 60s isolation',
    rpeTarget: 'RPE 7 — 3 reps in reserve',
    loadNote: "Baseline weight — last cycle's Week 4 deload load, +5%",
    color: 'var(--color-blue)',
  },
  {
    week: 2,
    name: 'Accumulation B',
    focus: 'Add volume — same reps, one more working set per exercise',
    repGuidance: '8–12 reps compounds · 12–15 isolation',
    restGuidance: '90s compounds · 60s isolation',
    rpeTarget: 'RPE 8 — 2 reps in reserve',
    loadNote: '+2.5kg on every compound vs Week 1',
    color: 'var(--color-teal)',
  },
  {
    week: 3,
    name: 'Intensification — Peak Week',
    focus: 'Heaviest week of the cycle. This is where PRs happen.',
    repGuidance: '4–6 reps compounds · 8–10 isolation',
    restGuidance: '2–3 min compounds · 90s isolation',
    rpeTarget: 'RPE 9 — 1 rep in reserve',
    loadNote: '+5–7.5kg on compounds vs Week 2 — chase a real PR on at least one lift',
    color: 'var(--color-accent)',
  },
  {
    week: 4,
    name: 'Deload',
    focus: 'Active recovery. Protect the joints, let the CNS reset.',
    repGuidance: '10–12 reps · same movements, technique-only focus',
    restGuidance: 'As needed — no rush, no ego',
    rpeTarget: 'RPE 5–6 — 5+ reps in reserve',
    loadNote: '−40% load vs Week 3. Non-negotiable — skipping this is what stalls the next cycle.',
    color: 'var(--color-purple)',
  },
]

// Anchor is a Monday so cycle weeks line up with the app's Mon-start training week.
const CYCLE_ANCHOR = new Date(2024, 0, 1) // Mon 1 Jan 2024

export function getCurrentMesoWeek(): MesoWeek {
  const daysSince = Math.floor((Date.now() - CYCLE_ANCHOR.getTime()) / 86_400_000)
  const weekNumber = Math.floor(daysSince / 7)
  const weekInCycle = (((weekNumber % 4) + 4) % 4) + 1 // 1..4, safe against any clock weirdness
  return MESOCYCLE.find((w) => w.week === weekInCycle)!
}
