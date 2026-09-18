// Ported 1:1 from legacy/Abhishek_GodMode_Hub_v7.html (Schedule → Workout → Split)

export interface ExerciseBlock {
  heading: string
  color?: string
  exercises: { name: string; sets: string }[]
}
export interface SplitDay {
  dow: string
  color: string
  emoji: string
  title: string
  subtitle: string
  banner: { kind: 'succ' | 'warn' | 'danger' | 'tip'; text: string }
  blocks: ExerciseBlock[]
}

export const SPLIT: SplitDay[] = [
  {
    dow: 'MON', color: 'var(--color-blue)', emoji: '🏋️',
    title: 'Pull Day A — Back, Biceps, Forearms',
    subtitle: '8:30 AM · Skill: HS 6:45 AM · Zone 2 after office',
    banner: { kind: 'succ', text: 'Mon = Pull A. Zone 2 walk in the evening after office. Creatine 5g with Meal 2.' },
    blocks: [
      { heading: 'SKILL — 6:45 AM (20 min)', color: 'var(--color-purple)', exercises: [
        { name: 'Wrist warm-up — circles, prayer stretch, rocks', sets: '3 min' },
        { name: 'Hollow body hold — ribs closed, toes pointed', sets: '4×30s' },
        { name: 'Chest-to-wall HS hold — push floor away', sets: '4×max hold' },
        { name: 'Freestanding kick-up attempts', sets: '10 attempts' },
      ]},
      { heading: 'NEURO PRIMER — Do First (before everything)', color: 'var(--color-teal)', exercises: [
        { name: 'Scapular Pull-ups — dead hang, blade shrug only, arms stay straight', sets: '3×8 slow' },
      ]},
      { heading: 'Back — Width', exercises: [
        { name: 'Pull-ups / Lat pulldown (progressive)', sets: '4×8–10' },
        { name: 'Seated cable row — full squeeze', sets: '4×10' },
        { name: 'Single-arm DB row — chest on incline bench', sets: '3×12 each' },
        { name: 'Face pulls — rear delt + rotator cuff', sets: '4×15' },
      ]},
      { heading: 'Biceps', exercises: [
        { name: 'Barbell curl — full extension', sets: '3×10' },
        { name: 'Hammer curl (cross-body)', sets: '3×12' },
      ]},
      { heading: 'Forearms', exercises: [
        { name: 'Wrist roller — both directions', sets: '3 sets' },
        { name: 'Reverse wrist curl', sets: '3×15' },
      ]},
      { heading: 'Core', exercises: [
        { name: 'Hanging knee raises → leg raises', sets: '3×12' },
        { name: 'Plank — straight body, glutes squeezed', sets: '3×40s' },
        { name: 'Cable crunch', sets: '3×15' },
      ]},
      { heading: 'Zone 2 Finisher', color: 'var(--color-green)', exercises: [
        { name: 'Incline treadmill walk — 10–12% grade', sets: '15 min' },
      ]},
    ],
  },
  {
    dow: 'TUE', color: 'var(--color-amber)', emoji: '🏋️',
    title: 'Push Day A — Chest, Shoulders, Triceps',
    subtitle: '8:30 AM · HIIT finisher · No HS today',
    banner: { kind: 'warn', text: 'Tue = Push A. HIIT finisher at end. Wrists rest today for Saturday HS.' },
    blocks: [
      { heading: 'Chest', exercises: [
        { name: 'Barbell/DB bench press — 2-1-3 tempo', sets: '4×8' },
        { name: 'Incline DB press — upper chest', sets: '4×10' },
        { name: 'Cable fly — full stretch', sets: '3×12' },
      ]},
      { heading: 'Shoulders', exercises: [
        { name: 'Overhead press — seated upright', sets: '4×8' },
        { name: 'Lateral raise — slow eccentric, 3 sec down', sets: '3×15' },
        { name: 'Rear delt fly — bent over, light', sets: '3×15' },
      ]},
      { heading: 'REAR DELT + ROTATOR CUFF (HS Stability)', color: 'var(--color-purple)', exercises: [
        { name: 'Face pulls — cable at face height, elbows high, external rotate at end', sets: '3×15 strict' },
        { name: 'Overhead DB Y-Raise — prone on incline bench, thumbs up, squeeze shoulder blades', sets: '3×12 light' },
      ]},
      { heading: 'Triceps', exercises: [
        { name: 'Skull crushers — full extension', sets: '3×10' },
        { name: 'Rope pushdown — flare at bottom', sets: '3×15' },
      ]},
      { heading: 'HIIT Finisher', color: 'var(--color-accent)', exercises: [
        { name: 'Jump rope / stair sprints — 60s on, 60s off', sets: '6 rounds' },
      ]},
    ],
  },
  {
    dow: 'WED', color: 'var(--color-accent)', emoji: '🏋️',
    title: 'Leg Day — Heavy Squats + Hams + Glutes',
    subtitle: '8:30 AM · Highest kcal day · Wrist specialist work 6:45 AM',
    banner: { kind: 'danger', text: 'Wed = Leg Day. 3900 kcal target. Chicken at lunch + extra rice. Wrist specialist work before gym.' },
    blocks: [
      { heading: 'WRIST SPECIALIST — 6:45 AM (WED only)', color: 'var(--color-purple)', exercises: [
        { name: 'Plate pinch — 30s hold, builds HS fingertip balance', sets: '3×30s' },
        { name: 'Wrist roller — both directions', sets: '3 sets' },
      ]},
      { heading: 'Quads', exercises: [
        { name: 'Barbell back squat — ATG depth, chest up', sets: '5×5 (heavy)' },
        { name: 'Leg press — full ROM, don\'t lock knees', sets: '4×12' },
        { name: 'Hack squat / front squat', sets: '3×10' },
      ]},
      { heading: 'Hamstrings + Glutes', exercises: [
        { name: 'Romanian deadlift — hinge at hip, soft knees', sets: '4×10' },
        { name: 'Lying leg curl — slow, squeeze at top', sets: '3×12' },
        { name: 'Hip thrust — full extension, pause at top', sets: '3×15' },
      ]},
      { heading: 'Calves + Core', exercises: [
        { name: 'Standing calf raise — full ROM, 3 sec down', sets: '4×20' },
        { name: 'Hanging leg raise — straight legs', sets: '3×12' },
      ]},
    ],
  },
  {
    dow: 'THU', color: 'var(--color-teal)', emoji: '🏋️',
    title: 'Pull Day B — Deadlift + Back Thickness',
    subtitle: '8:30 AM · Skill: HS 6:45 AM',
    banner: { kind: 'succ', text: 'Thu = Pull B. Focus on thickness. HS: try longest freestanding holds mid-week.' },
    blocks: [
      { heading: 'SKILL — 6:45 AM', color: 'var(--color-purple)', exercises: [
        { name: 'Wrist warm-up + hollow body', sets: '4×30s' },
        { name: 'Chest-to-wall HS — shoulder taps', sets: '3×10 each' },
        { name: 'Freestanding kick-up attempts', sets: '10 attempts' },
      ]},
      { heading: 'NEURO PRIMER — Do First (before everything)', color: 'var(--color-teal)', exercises: [
        { name: 'Scapular Pull-ups — dead hang, shoulder blade shrug only, zero elbow bend', sets: '3×8 slow' },
      ]},
      { heading: 'Back — Thickness', exercises: [
        { name: 'Deadlift (conventional) — hip hinge, brace core', sets: '4×5 (heavy)' },
        { name: 'Pendlay row — explosive pull', sets: '4×8' },
        { name: 'T-bar row / chest-supported row', sets: '4×10' },
      ]},
      { heading: 'Biceps + Forearms', exercises: [
        { name: 'Incline DB curl — full stretch at bottom', sets: '3×10' },
        { name: 'Reverse barbell curl — visible forearm width', sets: '3×12' },
      ]},
      { heading: 'Core — Hollow Body Focus', exercises: [
        { name: 'Hollow body rock — back flat, controlled', sets: '3×10' },
        { name: 'Side plank — 40s each side', sets: '3×40s' },
        { name: 'Ab wheel rollout — from knees', sets: '3×10' },
      ]},
    ],
  },
  {
    dow: 'FRI', color: 'var(--color-green)', emoji: '🏋️',
    title: 'Push Day B + Bicep Finisher',
    subtitle: '8:30 AM · Wrists resting for SAT',
    banner: { kind: 'tip', text: 'Fri = Push B. End of week upper volume. Wrists rest today — no HS skill until Saturday morning.' },
    blocks: [
      { heading: 'Chest + Shoulders', exercises: [
        { name: 'DB press — alternating, full ROM', sets: '4×10' },
        { name: 'Arnold press — pronation through ROM', sets: '3×12' },
        { name: 'Cable lateral raise', sets: '3×15' },
        { name: 'Decline DB fly — lower chest, full stretch', sets: '3×12' },
      ]},
      { heading: 'REAR DELT + ROTATOR CUFF (HS Stability)', color: 'var(--color-purple)', exercises: [
        { name: 'Face pulls — cable at face height, elbows high, external rotate hard at end', sets: '3×15 strict' },
        { name: 'Overhead DB Y-Raise — prone on incline bench, thumbs up, scapula pinch', sets: '3×12 light' },
      ]},
      { heading: 'Triceps', exercises: [
        { name: 'Close-grip bench — elbows in, full lockout', sets: '4×10' },
        { name: 'Overhead tricep extension — long head stretch', sets: '3×12' },
      ]},
      { heading: 'Bicep Finisher', exercises: [
        { name: '21s barbell curl — 7+7+7', sets: '3 sets' },
        { name: 'Concentration curl — peak contraction', sets: '3×12 each' },
      ]},
      { heading: 'Core', exercises: [
        { name: 'Decline crunch — weighted', sets: '3×15' },
        { name: 'Bicycle crunch — oblique focus', sets: '3×20' },
      ]},
    ],
  },
  {
    dow: 'SAT', color: 'var(--color-purple)', emoji: '🏠🌳',
    title: 'HS Mastery + Park Athletic Legs',
    subtitle: '6:40 AM home · 10:00 AM park · Crown jewel HS day',
    banner: { kind: 'succ', text: 'Saturday = crown jewel. Wrists untouched since Wed. No pressing yesterday. Nervous system learns fastest here.' },
    blocks: [
      { heading: 'HOME — 6:40 AM (25 min)', color: 'var(--color-purple)', exercises: [
        { name: 'Thorough wrist warm-up — all directions', sets: '3 min' },
        { name: 'Hollow body hold — perfect tension', sets: '4×30s' },
        { name: 'Chest-to-wall HS — longest holds of week', sets: '5×max (aim 45s)' },
        { name: 'HS shoulder taps — slow weight shift', sets: '3×10 each' },
        { name: 'Freestanding kick-up — money session', sets: '15 attempts' },
      ]},
      { heading: 'PARK — 10:00 AM · Legs — Explosive', color: 'var(--color-purple)', exercises: [
        { name: 'Bulgarian split squat — deep ROM', sets: '4×12 each' },
        { name: 'Jump squats — max height, land soft', sets: '3×12' },
        { name: 'Glute-Ham Raise / Superman Hold — hamstrings + lower back, zero spinal load', sets: '3×10 / 3×30s' },
        { name: 'Step-ups with DB — full hip extension', sets: '3×12 each' },
        { name: 'Pistol squat progression', sets: '3×6 each' },
      ]},
      { heading: 'Core + HIIT', exercises: [
        { name: 'Plank series — front + both sides', sets: '3×40s each' },
        { name: 'Ab wheel + Dragon flag negative', sets: '3×10 / 3×5' },
        { name: 'Stair sprint intervals — 2 min hard, 1 min rest', sets: '5 rounds' },
      ]},
    ],
  },
  {
    dow: 'SUN', color: 'var(--color-text-3)', emoji: '🏠',
    title: 'Sacred Recovery',
    subtitle: 'No gym · Stretch + foam roll · Adaptation day',
    banner: { kind: 'tip', text: 'Gains are MADE here. Muscles grow during recovery, not training. One gentle block only.' },
    blocks: [
      { heading: 'Recovery Block', exercises: [
        { name: 'Light walk — 20–30 min, easy pace', sets: '1×' },
        { name: 'Full body stretch — 30s per muscle', sets: '15 min' },
        { name: 'Foam rolling — quads, lats, thoracic spine', sets: '10 min' },
        { name: 'Gentle wrist mobility — circles only', sets: '5 min' },
        { name: '8+ hrs sleep tonight — GH peaks in deep sleep', sets: 'Priority #1' },
      ]},
    ],
  },
]

export interface SkillStep {
  num: number
  name: string
  desc: string
  target: string
  highlight?: boolean
}
export const HS_LADDER: SkillStep[] = [
  { num: 1, name: 'Wrist Conditioning', desc: 'Circles, prayer stretch, reverse prayer, wrist rocks. Non-negotiable.', target: '5 min daily · Weeks 1–4' },
  { num: 2, name: 'Hollow Body Hold', desc: 'Lower back flat, ribs closed, legs straight, arms overhead. This IS the handstand.', target: '30s hold · Weeks 1–3' },
  { num: 3, name: 'Chest-to-Wall Hold', desc: 'Face wall, hands 6–8 inches from it. Belly touching wall. Straight line wrists to ankles.', target: '60s hold · Weeks 2–6' },
  { num: 4, name: 'Shoulder Taps in HS', desc: 'Chest-to-wall, shift weight slowly, tap opposite shoulder. Balance training begins.', target: '10 taps each side · Weeks 4–8' },
  { num: 5, name: 'Kick-up Practice', desc: 'From lunge, kick up. Feel the entry and stacking point — not about going straight yet.', target: 'Controlled entry · Weeks 4–10' },
  { num: 6, name: 'Freestanding Hold', desc: 'Away from wall. 1s → 3s → 5s → 10s. Fingertips are the balance tool.', target: '10s hold · Weeks 8–16' },
  { num: 7, name: 'Handstand Push-up', desc: 'Pike → elevated pike → wall HSPU → freestanding HSPU. End game.', target: '5 reps · Months 4–6' },
]
export const MU_LADDER: SkillStep[] = [
  { num: 1, name: '10 Clean Pull-ups', desc: 'Dead hang, full extension. No kipping. Chin clearly over bar.', target: '10 reps · Weeks 1–6' },
  { num: 2, name: 'Scapular Pull-ups (Dead-Hang Shrugs)', desc: 'Hang dead from bar. Without bending elbows, shrug shoulder blades down and together. Fires the serratus + lower trap — the exact neuro pathway for strict muscle-up initiation. Do first every Pull Day.', target: '3×8 every Pull Day · Weeks 1–ongoing', highlight: true },
  { num: 3, name: 'Dip Strength (10+ reps)', desc: 'Without 10 strong dips, the transition fails every time.', target: '10 strict dips · Weeks 1–4' },
  { num: 4, name: 'Explosive Chest-to-Bar Pull-ups', desc: 'Max acceleration from dead hang. Pull so explosively your chest touches the bar. No kipping — pure vertical speed. Log reps as "C2B" in session tracker.', target: '5 C2B reps · Weeks 4–8', highlight: true },
  { num: 5, name: 'Negative Muscle-up', desc: 'Jump to top, lower through entire movement slowly. Builds connective tissue.', target: '5 slow negatives · Weeks 6–10' },
  { num: 6, name: 'Hollow-Body Bar Hangs + L-Sit Regressions', desc: 'Hang in perfect hollow body, then progress to L-sit hold while hanging. Trains the strict position required for a clean muscle-up.', target: '30s hollow → 10s L-sit hang · Weeks 4–12', highlight: true },
  { num: 7, name: 'First Muscle-up', desc: 'Slight kip is legitimate. Go explosive, get hips to bar, transition wrists, press out.', target: '1 clean rep · Months 3–5' },
  { num: 8, name: 'Strict Muscle-up', desc: 'No swing, no kip. Pure power. Elite tier calisthenics.', target: '3 strict · Months 5–8' },
]

export const HR_ZONES = [
  { z: 'Z1', label: 'Recovery', color: 'var(--color-blue)', calc: (max: number) => `<${Math.round(max * 0.59)}` },
  { z: 'Z2', label: 'Aerobic', color: 'var(--color-green)', calc: (max: number) => `${Math.round(max * 0.59)}–${Math.round(max * 0.66)}` },
  { z: 'Z3', label: 'Tempo', color: 'var(--color-teal)', calc: (max: number) => `${Math.round(max * 0.66)}–${Math.round(max * 0.73)}` },
  { z: 'Z4', label: 'Threshold', color: 'var(--color-amber)', calc: (max: number) => `${Math.round(max * 0.73)}–${Math.round(max * 0.8)}` },
  { z: 'Z5', label: 'Max', color: 'var(--color-accent)', calc: (max: number) => `${Math.round(max * 0.8)}+` },
]

export const LAWS = [
  { n: 1, text: 'Skill before iron. HS work ALWAYS before main session. Fatigued shoulders = no progress.' },
  { n: 2, text: 'Rep tempo: 2 sec up · 1 sec hold · 3 sec down. Never bounce reps.' },
  { n: 3, text: 'Rest strictly: 90–120s compounds · 60s isolation · 45s abs/wrists.' },
  { n: 4, text: 'Progressive overload: +2.5kg compound every 1–2 weeks. Track every session.' },
  { n: 5, text: 'Hollow body is everything. It IS the handstand position. Master it first.' },
  { n: 6, text: 'Post-workout window: Meal 2 within 45 min of finishing. Non-negotiable.' },
  { n: 7, text: '7 hours minimum sleep. Where adaptation happens. Protect it.' },
  { n: 8, text: 'Wrist health = skill health. Never train through joint pain. Warm up every session.' },
  { n: 9, text: 'Legs are the throne. Never skip Wed. No exceptions.' },
  { n: 10, text: 'Cardio is integrated. Short rest + HIIT finishers + Zone 2 walks.' },
  { n: 11, text: 'Sunday is sacred. Zero heavy training. Growth happens in recovery.' },
  { n: 12, text: 'Stop 1–2 reps before failure on compounds. CNS fatigue = regression.' },
]
