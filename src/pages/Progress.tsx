import { useMemo, useState } from 'react'
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts'
import { motion } from 'motion/react'
import { GlassCard, SectionTitle, Segmented, ProgressBar, TextField, Button, mix } from '../components/ui'
import { CountUp } from '../components/CountUp'
import { TrophyIcon, SparklesIcon, ScaleIcon, XIcon, LockIcon, LoaderIcon, CheckCircleIcon } from '../components/icons'
import { useStore } from '../store/StoreContext'
import { WEIGHT_BASELINE, WEIGHT_TARGET, AURA_TARGETS, SKILL_UNLOCKS } from '../data/plan'

type Top = 'weight' | 'streak' | 'goals'

export default function Progress() {
  const [top, setTop] = useState<Top>('weight')
  return (
    <div className="px-4 pb-4">
      <Segmented
        value={top}
        onChange={setTop}
        options={[
          { value: 'weight', label: 'Weight' },
          { value: 'streak', label: 'Streak' },
          { value: 'goals', label: 'Goals' },
        ]}
      />
      {top === 'weight' && <WeightView />}
      {top === 'streak' && <StreakView />}
      {top === 'goals' && <GoalsView />}
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
