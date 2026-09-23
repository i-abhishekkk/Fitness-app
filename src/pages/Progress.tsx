import { useEffect, useMemo, useState } from 'react'
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts'
import { motion } from 'motion/react'
import { GlassCard, SectionTitle, Segmented, SelectField, ProgressBar, TextField, Button, mix } from '../components/ui'
import { CountUp } from '../components/CountUp'
import { TrophyIcon, SparklesIcon, ScaleIcon, XIcon, LockIcon, LoaderIcon, CheckCircleIcon, RulerIcon, DumbbellIcon } from '../components/icons'
import { useStore } from '../store/StoreContext'
import { WEIGHT_BASELINE, WEIGHT_TARGET, AURA_TARGETS, SKILL_UNLOCKS } from '../data/plan'
import type { MeasurementEntry } from '../store/appState'

type Top = 'weight' | 'body' | 'lifts' | 'streak' | 'goals'

export default function Progress() {
  const [top, setTop] = useState<Top>('weight')
  return (
    <div className="px-4 pb-4">
      <Segmented
        value={top}
        onChange={setTop}
        options={[
          { value: 'weight', label: 'Weight' },
          { value: 'body', label: 'Body' },
          { value: 'lifts', label: 'Lifts' },
          { value: 'streak', label: 'Streak' },
          { value: 'goals', label: 'Goals' },
        ]}
      />
      {top === 'weight' && <WeightView />}
      {top === 'body' && <BodyView />}
      {top === 'lifts' && <LiftsView />}
      {top === 'streak' && <StreakView />}
      {top === 'goals' && <GoalsView />}
    </div>
  )
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'var(--color-blue)' }
  if (bmi < 25) return { label: 'Normal', color: 'var(--color-green)' }
  if (bmi < 30) return { label: 'Overweight', color: 'var(--color-amber)' }
  return { label: 'Obese', color: 'var(--color-accent)' }
}

const MEASUREMENT_FIELDS: { key: keyof Omit<MeasurementEntry, 'date'>; label: string }[] = [
  { key: 'chest', label: 'Chest (cm)' },
  { key: 'waist', label: 'Waist (cm)' },
  { key: 'hips', label: 'Hips (cm)' },
  { key: 'arms', label: 'Arms (cm)' },
  { key: 'thighs', label: 'Thighs (cm)' },
  { key: 'neck', label: 'Neck (cm)' },
]

function BodyView() {
  const { state, setState } = useStore()
  const [heightInput, setHeightInput] = useState(state.heightCm ? String(state.heightCm) : '')
  const [fields, setFields] = useState<Record<string, string>>({})

  const currentWeight = state.weights.at(-1)?.kg ?? WEIGHT_BASELINE
  const bmi = state.heightCm ? currentWeight / (state.heightCm / 100) ** 2 : null
  const cat = bmi ? bmiCategory(bmi) : null

  const saveHeight = () => {
    const cm = parseFloat(heightInput)
    if (Number.isNaN(cm) || cm <= 0) return
    setState((s) => ({ ...s, heightCm: cm }))
  }

  const logMeasurements = () => {
    const entry: MeasurementEntry = { date: new Date().toISOString() }
    let any = false
    for (const f of MEASUREMENT_FIELDS) {
      const v = parseFloat(fields[f.key] ?? '')
      if (!Number.isNaN(v) && v > 0) {
        entry[f.key] = v
        any = true
      }
    }
    if (!any) return
    setState((s) => ({ ...s, measurements: [...s.measurements, entry] }))
    setFields({})
  }

  const delMeasurement = (idx: number) => setState((s) => ({ ...s, measurements: s.measurements.filter((_, i) => i !== idx) }))

  return (
    <div className="space-y-3">
      <GlassCard glow={cat?.color ?? 'var(--color-blue)'}>
        <SectionTitle icon={<ScaleIcon width={14} height={14} />} color={cat?.color}>Body Mass Index</SectionTitle>
        {bmi ? (
          <div className="flex items-center gap-4">
            <div>
              <div className="font-[var(--font-mono)] text-3xl font-extrabold" style={{ color: cat?.color }}>
                <CountUp value={bmi} decimals={1} />
              </div>
              <div className="mt-0.5 text-[11px] font-semibold" style={{ color: cat?.color }}>{cat?.label}</div>
            </div>
            <div className="flex-1 text-[10.5px] leading-relaxed text-[var(--color-text-3)]">
              Computed live from your current weight ({currentWeight.toFixed(1)}kg) and height ({state.heightCm}cm) — updates automatically as either changes.
            </div>
          </div>
        ) : (
          <div className="text-[12px] text-[var(--color-text-3)]">Add your height below to see BMI.</div>
        )}
        <div className="mt-3 flex gap-2">
          <TextField type="number" value={heightInput} onChange={(e) => setHeightInput(e.target.value)} placeholder="Height (cm)" />
          <Button variant="secondary" color="var(--color-blue)" onClick={saveHeight}>Save</Button>
        </div>
      </GlassCard>

      <GlassCard glow="var(--color-teal)">
        <SectionTitle icon={<RulerIcon width={14} height={14} />} color="var(--color-teal)">Log Measurements</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          {MEASUREMENT_FIELDS.map((f) => (
            <TextField
              key={f.key}
              type="number"
              value={fields[f.key] ?? ''}
              onChange={(e) => setFields((s) => ({ ...s, [f.key]: e.target.value }))}
              placeholder={f.label}
            />
          ))}
        </div>
        <div className="mt-3">
          <Button full color="var(--color-teal)" onClick={logMeasurements}>Log Today's Measurements</Button>
        </div>
      </GlassCard>

      {state.measurements.length > 0 && (
        <GlassCard>
          <SectionTitle>History</SectionTitle>
          {state.measurements.slice().reverse().map((m, i) => (
            <div key={i} className="border-b border-white/[0.06] py-2.5 last:border-none">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-text-3)]">{new Date(m.date).toLocaleDateString()}</span>
                <button onClick={() => delMeasurement(state.measurements.length - 1 - i)} className="text-[var(--color-text-3)] transition-colors hover:text-[var(--color-accent)]">
                  <XIcon width={13} height={13} />
                </button>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-[var(--font-mono)] text-[11px] text-[var(--color-text-2)]">
                {MEASUREMENT_FIELDS.filter((f) => m[f.key] != null).map((f) => (
                  <span key={f.key}>{f.label.split(' ')[0]}: {m[f.key]}cm</span>
                ))}
              </div>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  )
}

function WeightView() {
  const { state, setState } = useStore()
  const [input, setInput] = useState('')
  const weights = state.weights
  const current = weights.at(-1)?.kg ?? WEIGHT_BASELINE
  const gained = current - WEIGHT_BASELINE
  const chg = weights.length >= 2 ? current - weights[weights.length - 2].kg : 0

  const chartData = weights.map((w) => ({ date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), kg: w.kg }))

  const logWeight = () => {
    const kg = parseFloat(input)
    if (Number.isNaN(kg)) return
    setState((s) => ({ ...s, weights: [...s.weights, { date: new Date().toISOString(), kg }] }))
    setInput('')
  }
  const delWeight = (idx: number) => setState((s) => ({ ...s, weights: s.weights.filter((_, i) => i !== idx) }))

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <GlassCard glow="var(--color-blue)">
          <div className="text-[10.5px] text-[var(--color-text-3)]">Current weight</div>
          <div className="mt-1 font-[var(--font-mono)] text-xl font-extrabold"><CountUp value={current} decimals={1} suffix=" kg" /></div>
          {chg !== 0 && (
            <div className="mt-0.5 text-[10.5px]" style={{ color: chg > 0 ? 'var(--color-green)' : 'var(--color-accent)' }}>
              {chg > 0 ? '+' : ''}{chg.toFixed(1)} kg
            </div>
          )}
        </GlassCard>
        <GlassCard glow="var(--color-green)">
          <div className="text-[10.5px] text-[var(--color-text-3)]">Total gained</div>
          <div className="mt-1 font-[var(--font-mono)] text-xl font-extrabold">
            {gained >= 0 ? '+' : ''}<CountUp value={gained} decimals={1} suffix=" kg" />
          </div>
          <div className="mt-0.5 text-[10.5px] text-[var(--color-text-3)]">Target +{(WEIGHT_TARGET - WEIGHT_BASELINE).toFixed(0)} kg</div>
        </GlassCard>
      </div>
      <GlassCard>
        <SectionTitle icon={<ScaleIcon width={14} height={14} />}>Weight Trend</SectionTitle>
        {chartData.length >= 2 ? (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2fe28f" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#2fe28f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip
                  contentStyle={{ background: 'rgba(18,20,28,0.92)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, fontSize: 11, backdropFilter: 'blur(8px)' }}
                  labelStyle={{ color: 'var(--color-text-2)' }}
                  itemStyle={{ color: '#2fe28f' }}
                />
                <Area type="monotone" dataKey="kg" stroke="#2fe28f" strokeWidth={2.5} fill="url(#weightFill)" dot={{ r: 3, fill: '#2fe28f', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex min-h-[140px] items-center justify-center rounded-xl bg-white/[0.03] text-[11.5px] text-[var(--color-text-3)]">
            Log 2+ entries to see the trend
          </div>
        )}
      </GlassCard>
      <GlassCard>
        <SectionTitle>Log Weight</SectionTitle>
        <div className="flex gap-2">
          <TextField type="number" step="0.1" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Today's weight (kg)" />
          <button onClick={logWeight} className="shrink-0 rounded-xl border border-white/10 px-4 text-[11.5px] font-semibold text-[var(--color-text-2)] transition-colors hover:bg-white/5 active:scale-95">
            Log
          </button>
        </div>
        {weights.length > 0 && (
          <div className="mt-3">
            {weights.slice().reverse().slice(0, 8).map((w, i) => (
              <div key={i} className="flex items-center justify-between border-b border-white/[0.06] py-2 text-[12px] last:border-none">
                <span className="text-[var(--color-text-3)]">{new Date(w.date).toLocaleDateString()}</span>
                <span className="font-[var(--font-mono)] font-bold">{w.kg.toFixed(1)} kg</span>
                <button onClick={() => delWeight(weights.length - 1 - i)} className="text-[var(--color-text-3)] transition-colors hover:text-[var(--color-accent)]">
                  <XIcon width={13} height={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}

/** Epley formula — the standard estimated-1RM approximation used across strength coaching,
 *  accurate enough for tracking trend direction (not meant as a literal max-out prediction). */
function estimate1RM(weightKg: number, reps: number): number {
  return weightKg * (1 + reps / 30)
}

function LiftsView() {
  const { state } = useStore()
  const [metric, setMetric] = useState<'e1rm' | 'volume'>('e1rm')

  const exerciseNames = useMemo(() => {
    const set = new Set<string>()
    state.sessions.forEach((s) => s.exercises.forEach((e) => e.raw?.length && set.add(e.name)))
    return Array.from(set).sort()
  }, [state.sessions])

  const [selected, setSelected] = useState(exerciseNames[0] ?? '')
  useEffect(() => {
    if (exerciseNames.length && !exerciseNames.includes(selected)) setSelected(exerciseNames[0])
  }, [exerciseNames, selected])

  const points = useMemo(() => {
    return state.sessions
      .filter((s) => s.exercises.some((e) => e.name === selected && e.raw?.length))
      .map((s) => {
        const ex = s.exercises.find((e) => e.name === selected)!
        const sets = ex.raw!
        // e1RM takes the single best set (the one that estimates the highest max) — that's what
        // a strength trend should track, not an average across a warmup-to-topset spread.
        // Volume sums every set actually done that session.
        return {
          rawDate: s.date,
          date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          e1rm: Math.round(Math.max(...sets.map((set) => estimate1RM(set.weightKg, set.reps))) * 10) / 10,
          volume: sets.reduce((sum, set) => sum + set.reps * set.weightKg, 0),
        }
      })
      .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
  }, [state.sessions, selected])

  const latest = points.at(-1)
  const best = points.length ? Math.max(...points.map((p) => p[metric])) : 0
  const color = metric === 'e1rm' ? 'var(--color-accent)' : 'var(--color-teal)'

  return (
    <div className="space-y-3">
      <GlassCard glow={color}>
        <SectionTitle icon={<DumbbellIcon width={14} height={14} />} color={color}>Strength Progression</SectionTitle>
        {exerciseNames.length === 0 ? (
          <div className="py-6 text-center text-[12px] leading-relaxed text-[var(--color-text-3)]">
            No structured sets logged yet — fill in Sets, Reps, Weight (and RPE) for an exercise in Tracker → Log to see its progression here.
          </div>
        ) : (
          <>
            <div className="mb-3">
              <SelectField label="Exercise" value={selected} onChange={setSelected} options={exerciseNames} />
            </div>
            <Segmented
              value={metric}
              onChange={setMetric}
              options={[
                { value: 'e1rm', label: 'Est. 1RM' },
                { value: 'volume', label: 'Volume' },
              ]}
            />
            <div className="my-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.03] p-3 text-center">
                <div className="font-[var(--font-mono)] text-xl font-extrabold" style={{ color }}>
                  <CountUp value={latest?.[metric] ?? 0} decimals={metric === 'e1rm' ? 1 : 0} suffix={metric === 'e1rm' ? ' kg' : ' kg total'} />
                </div>
                <div className="mt-0.5 text-[9px] uppercase tracking-wide text-[var(--color-text-3)]">Latest session</div>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3 text-center">
                <div className="font-[var(--font-mono)] text-xl font-extrabold" style={{ color }}>
                  <CountUp value={best} decimals={metric === 'e1rm' ? 1 : 0} suffix={metric === 'e1rm' ? ' kg' : ' kg total'} />
                </div>
                <div className="mt-0.5 text-[9px] uppercase tracking-wide text-[var(--color-text-3)]">Best so far</div>
              </div>
            </div>
            {points.length >= 2 ? (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={points} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
                    <defs>
                      <linearGradient id="liftFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(18,20,28,0.92)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, fontSize: 11, backdropFilter: 'blur(8px)' }}
                      labelStyle={{ color: 'var(--color-text-2)' }}
                      itemStyle={{ color }}
                    />
                    <Area type="monotone" dataKey={metric} stroke={color} strokeWidth={2.5} fill="url(#liftFill)" dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex min-h-[140px] items-center justify-center rounded-xl bg-white/[0.03] text-[11.5px] text-[var(--color-text-3)]">
                Log this exercise with full Sets/Reps/Weight 2+ times to see the trend
              </div>
            )}
            <div className="mt-3 text-[10px] leading-relaxed text-[var(--color-text-3)]">
              Est. 1RM uses the Epley formula (weight × (1 + reps/30)) — a trend indicator, not a literal max-out prediction. Volume is sets × reps × weight for that session.
            </div>
          </>
        )}
      </GlassCard>
    </div>
  )
}

const WEEKS = 18

function StreakView() {
  const { state, setState } = useStore()
  const weeks = useMemo(() => {
    const now = new Date()
    const dow = now.getDay() // 0=Sun
    const daysSinceMonday = (dow + 6) % 7
    const start = new Date(now)
    start.setDate(now.getDate() - daysSinceMonday - (WEEKS - 1) * 7)
    const cols: string[][] = []
    for (let w = 0; w < WEEKS; w++) {
      const col: string[] = []
      for (let d = 0; d < 7; d++) {
        const day = new Date(start)
        day.setDate(start.getDate() + w * 7 + d)
        col.push(day.toISOString().slice(0, 10))
      }
      cols.push(col)
    }
    return cols
  }, [])
  const today = new Date().toISOString().slice(0, 10)
  const set = useMemo(() => new Set(state.streakDays), [state.streakDays])

  const { current, best } = useMemo(() => {
    const sorted = [...state.streakDays].sort()
    let cur = 0
    let c = today
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i] === c) {
        cur++
        const dt = new Date(c)
        dt.setDate(dt.getDate() - 1)
        c = dt.toISOString().slice(0, 10)
      } else if (sorted[i] < c) break
    }
    let maxS = 0, curS = 0, prev: string | null = null
    sorted.forEach((d) => {
      if (!prev) curS = 1
      else {
        const dt = new Date(prev)
        dt.setDate(dt.getDate() + 1)
        curS = dt.toISOString().slice(0, 10) === d ? curS + 1 : 1
      }
      maxS = Math.max(maxS, curS)
      prev = d
    })
    return { current: cur, best: maxS }
  }, [state.streakDays, today])

  // heat = length of the consecutive run ending at this day, for a richer intensity map
  const heatOf = (day: string) => {
    if (!set.has(day)) return 0
    let run = 0
    const d = new Date(day)
    while (set.has(d.toISOString().slice(0, 10))) {
      run++
      d.setDate(d.getDate() - 1)
      if (run > 30) break
    }
    return Math.min(1, run / 7)
  }

  const toggle = (day: string) =>
    setState((s) => ({
      ...s,
      streakDays: s.streakDays.includes(day) ? s.streakDays.filter((d) => d !== day) : [...s.streakDays, day],
    }))

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <GlassCard glow="var(--color-amber)">
          <div className="font-[var(--font-mono)] text-2xl font-extrabold text-[var(--color-amber)]"><CountUp value={current} /></div>
          <div className="mt-0.5 text-[9.5px] uppercase tracking-wide text-[var(--color-text-3)]">Current streak (days)</div>
        </GlassCard>
        <GlassCard glow="var(--color-purple)">
          <div className="font-[var(--font-mono)] text-2xl font-extrabold text-[var(--color-purple)]"><CountUp value={best} /></div>
          <div className="mt-0.5 text-[9.5px] uppercase tracking-wide text-[var(--color-text-3)]">Best streak (days)</div>
        </GlassCard>
      </div>
      <GlassCard>
        <SectionTitle>Consistency Map</SectionTitle>
        <div className="mb-2 text-[10.5px] text-[var(--color-text-3)]">Last {WEEKS} weeks · tap a day to toggle · brighter = longer streak</div>
        <div className="overflow-x-auto">
          <div className="flex gap-[3px]" style={{ width: 'max-content' }}>
            {weeks.map((col, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {col.map((day) => {
                  const done = set.has(day)
                  const isToday = day === today
                  const heat = heatOf(day)
                  const isFuture = day > today
                  return (
                    <button
                      key={day}
                      disabled={isFuture}
                      onClick={() => toggle(day)}
                      title={day}
                      className="h-[13px] w-[13px] rounded-[3px] transition-transform disabled:opacity-20"
                      style={{
                        background: done ? mix('var(--color-green)', 30 + heat * 70) : 'rgba(255,255,255,0.045)',
                        outline: isToday ? '1.5px solid var(--color-amber)' : 'none',
                        outlineOffset: 1,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[9.5px] text-[var(--color-text-3)]">
          Less
          {[0, 0.25, 0.5, 0.75, 1].map((h) => (
            <span key={h} className="h-2.5 w-2.5 rounded-[2px]" style={{ background: h === 0 ? 'rgba(255,255,255,0.045)' : mix('var(--color-green)', 30 + h * 70) }} />
          ))}
          More
        </div>
      </GlassCard>
    </div>
  )
}

function GoalsView() {
  const { state } = useStore()
  const current = state.weights.at(-1)?.kg ?? WEIGHT_BASELINE
  const wpct = Math.min(100, Math.round(((current - WEIGHT_BASELINE) / (WEIGHT_TARGET - WEIGHT_BASELINE)) * 100))
  const a = state.aura

  const skills = [
    { name: `Handstand hold (${AURA_TARGETS.hs}s goal)`, raw: `${a.hsRaw}s`, target: AURA_TARGETS.hs, val: a.hsRaw, color: 'var(--color-purple)' },
    { name: `Pull-ups (${AURA_TARGETS.pu} reps goal)`, raw: `${a.puRaw} reps`, target: AURA_TARGETS.pu, val: a.puRaw, color: 'var(--color-blue)' },
    { name: `Dips (${AURA_TARGETS.mu} reps goal)`, raw: `${a.muRaw} reps`, target: AURA_TARGETS.mu, val: a.muRaw, color: 'var(--color-accent)' },
    { name: `Stair sets (${AURA_TARGETS.cv} sets goal)`, raw: `${a.cvRaw} sets`, target: AURA_TARGETS.cv, val: a.cvRaw, color: 'var(--color-green)' },
  ]

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong relative overflow-hidden rounded-2xl p-5"
      >
        <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[var(--color-accent)] opacity-20 blur-3xl" />
        <div className="relative flex items-center gap-1.5 font-[var(--font-mono)] text-[10px] font-bold tracking-[1.5px] text-[var(--color-accent)]">
          <SparklesIcon width={12} height={12} /> TRANSFORMATION TARGET
        </div>
        <div className="relative mt-1.5 font-[var(--font-display)] text-2xl font-semibold tracking-tight">
          {WEIGHT_BASELINE}kg → {WEIGHT_TARGET}kg Lean
        </div>
        <div className="relative mt-1.5 text-[12.5px] text-[var(--color-text-2)]">
          8–10 months · Hybrid athlete build · Calisthenics skills + iron strength
        </div>
      </motion.div>
      <GlassCard>
        <SectionTitle>Body Goals</SectionTitle>
        <div className="mb-1.5 flex justify-between text-[12.5px] font-bold">
          <span>Weight: {WEIGHT_BASELINE}kg → {WEIGHT_TARGET}kg</span>
          <span className="font-[var(--font-mono)] text-[var(--color-blue)]">{current.toFixed(1)}kg</span>
        </div>
        <ProgressBar pct={wpct} color="var(--color-blue)" />
        <div className="font-[var(--font-mono)] text-[10.5px] text-[var(--color-text-3)]">{wpct}% of target</div>
      </GlassCard>
      <GlassCard>
        <SectionTitle>Skill Goals</SectionTitle>
        {skills.map((s) => {
          const pct = Math.min(100, Math.round((s.val / s.target) * 100))
          return (
            <div key={s.name} className="mb-3 last:mb-0">
              <div className="mb-1.5 flex justify-between text-[12.5px] font-bold">
                <span>{s.name}</span>
                <span className="font-[var(--font-mono)]" style={{ color: s.color }}>{s.raw}</span>
              </div>
              <ProgressBar pct={pct} color={s.color} />
              <div className="font-[var(--font-mono)] text-[10.5px] text-[var(--color-text-3)]">{pct}% of target</div>
            </div>
          )
        })}
      </GlassCard>
      <GlassCard glow="var(--color-amber)">
        <SectionTitle icon={<TrophyIcon width={14} height={14} />} color="var(--color-amber)">Skill Unlock Tracker</SectionTitle>
        <SkillUnlocks />
      </GlassCard>
    </div>
  )
}

const UNLOCK_META = {
  locked: { label: 'Locked', color: 'var(--color-text-3)', Icon: LockIcon },
  current: { label: 'In Progress', color: 'var(--color-amber)', Icon: LoaderIcon },
  unlocked: { label: 'Unlocked', color: 'var(--color-green)', Icon: CheckCircleIcon },
} as const

function SkillUnlocks() {
  const { state, setState } = useStore()
  const cycle = (key: string) =>
    setState((s) => {
      const order: Array<keyof typeof UNLOCK_META> = ['locked', 'current', 'unlocked']
      const cur = s.skillUnlocks[key] ?? 'locked'
      const next = order[(order.indexOf(cur as keyof typeof UNLOCK_META) + 1) % order.length]
      return { ...s, skillUnlocks: { ...s.skillUnlocks, [key]: next } }
    })
  return (
    <div className="relative pl-1">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/10" />
      {SKILL_UNLOCKS.map((s) => {
        const status = state.skillUnlocks[s.key] ?? 'locked'
        const m = UNLOCK_META[status]
        return (
          <div key={s.key} className="relative flex items-center gap-3 py-2.5">
            <span className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg" style={{ background: mix(m.color, 18), border: `1px solid ${mix(m.color, 40)}` }}>
              {s.icon}
            </span>
            <span className="flex-1">
              <div className="text-[13px] font-bold">{s.name}</div>
              <div className="text-[10.5px] text-[var(--color-text-3)]">{s.week}</div>
            </span>
            <Button variant="ghost" onClick={() => cycle(s.key)}>
              <m.Icon width={13} height={13} style={{ color: m.color }} />
              <span style={{ color: m.color }} className="text-[10.5px] font-bold">{m.label}</span>
            </Button>
          </div>
        )
      })}
    </div>
  )
}
