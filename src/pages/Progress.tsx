import { useMemo, useState } from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts'
import { Card, CardTitle, Segmented, ProgressBar } from '../components/ui'
import { useStore } from '../store/StoreContext'
import { DOW, WEIGHT_BASELINE, WEIGHT_TARGET, AURA_TARGETS, SKILL_UNLOCKS } from '../data/plan'

type Top = 'weight' | 'streak' | 'goals'

export default function Progress() {
  const [top, setTop] = useState<Top>('weight')
  return (
    <div className="px-3 pb-4 pt-3">
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
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2.5">
        <Card>
          <div className="text-[10px] text-[var(--color-text-3)]">Current weight</div>
          <div className="mt-1 font-[var(--font-mono)] text-xl font-extrabold">{current.toFixed(1)} kg</div>
          {chg !== 0 && (
            <div className="mt-0.5 text-[10px]" style={{ color: chg > 0 ? 'var(--color-green)' : 'var(--color-accent)' }}>
              {chg > 0 ? '+' : ''}{chg.toFixed(1)} kg
            </div>
          )}
        </Card>
        <Card>
          <div className="text-[10px] text-[var(--color-text-3)]">Total gained</div>
          <div className="mt-1 font-[var(--font-mono)] text-xl font-extrabold">{gained >= 0 ? '+' : ''}{gained.toFixed(1)} kg</div>
          <div className="mt-0.5 text-[10px] text-[var(--color-text-3)]">Target: +{(WEIGHT_TARGET - WEIGHT_BASELINE).toFixed(0)} kg</div>
        </Card>
      </div>
      <Card>
        <CardTitle>Weight Chart</CardTitle>
        {chartData.length >= 2 ? (
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-bg-4)', border: '1px solid var(--color-border-2)', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: 'var(--color-text-2)' }}
                />
                <Line type="monotone" dataKey="kg" stroke="var(--color-green)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--color-green)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex min-h-[130px] items-center justify-center rounded-md bg-[var(--color-bg-3)] text-[11px] text-[var(--color-text-3)]">
            Log 2+ entries to see chart
          </div>
        )}
      </Card>
      <Card>
        <CardTitle>Log Weight</CardTitle>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Today's weight (kg)"
            className="flex-1 rounded-md border border-[var(--color-border-2)] bg-[var(--color-bg-3)] px-2.5 py-2 font-[var(--font-mono)] text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <button onClick={logWeight} className="rounded-md border border-[var(--color-border-2)] px-4 text-[11px] font-semibold text-[var(--color-text-2)] active:scale-95 transition-transform">
            Log
          </button>
        </div>
        {weights.length > 0 && (
          <div className="mt-3">
            {weights.slice().reverse().slice(0, 8).map((w, i) => (
              <div key={i} className="flex items-center justify-between border-b border-[var(--color-border)] py-1.5 text-[12px] last:border-none">
                <span className="text-[var(--color-text-3)]">{new Date(w.date).toLocaleDateString()}</span>
                <span className="font-[var(--font-mono)] font-bold">{w.kg.toFixed(1)} kg</span>
                <button onClick={() => delWeight(weights.length - 1 - i)} className="text-[var(--color-text-3)]">×</button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function StreakView() {
  const { state, setState } = useStore()
  const days = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 28 }).map((_, idx) => {
      const d = new Date(now)
      d.setDate(now.getDate() - (27 - idx))
      return d.toISOString().slice(0, 10)
    })
  }, [])
  const today = new Date().toISOString().slice(0, 10)
  const set = new Set(state.streakDays)

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

  const toggle = (day: string) =>
    setState((s) => ({
      ...s,
      streakDays: s.streakDays.includes(day) ? s.streakDays.filter((d) => d !== day) : [...s.streakDays, day],
    }))

  return (
    <Card>
      <CardTitle>🔥 Streak Calendar</CardTitle>
      <div className="mb-3 grid grid-cols-2 gap-2.5">
        <div className="rounded-md bg-[var(--color-bg-3)] p-2.5 text-center">
          <div className="font-[var(--font-mono)] text-2xl font-extrabold text-[var(--color-amber)]">{current}</div>
          <div className="text-[9px] text-[var(--color-text-3)]">CURRENT STREAK (days)</div>
        </div>
        <div className="rounded-md bg-[var(--color-bg-3)] p-2.5 text-center">
          <div className="font-[var(--font-mono)] text-2xl font-extrabold text-[var(--color-purple)]">{best}</div>
          <div className="text-[9px] text-[var(--color-text-3)]">BEST STREAK (days)</div>
        </div>
      </div>
      <div className="mb-2 font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">
        Last 28 days. Tap any day to toggle. Amber ring = today.
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const done = set.has(day)
          const isToday = day === today
          const dow = DOW[new Date(day).getDay()]
          return (
            <button
              key={day}
              onClick={() => toggle(day)}
              className="flex aspect-square flex-col items-center justify-center rounded-md border text-[9px]"
              style={{
                background: done ? 'var(--color-green-dim)' : 'var(--color-bg-3)',
                borderColor: isToday ? 'var(--color-amber)' : done ? 'var(--color-green)' : 'var(--color-border)',
                color: done ? 'var(--color-green)' : 'var(--color-text-3)',
              }}
            >
              <span>{dow.slice(0, 2)}</span>
              <span className="text-[11px]">{done ? '✓' : '·'}</span>
            </button>
          )
        })}
      </div>
    </Card>
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
    <div className="space-y-2.5">
      <div className="rounded-[10px] border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-bg-3)] to-[var(--color-bg-2)] p-4">
        <div className="font-[var(--font-mono)] text-[10px] font-bold tracking-[1.5px] text-[var(--color-accent)]">
          TRANSFORMATION TARGET
        </div>
        <div className="mt-1 font-[var(--font-display)] text-2xl tracking-wide">
          {WEIGHT_BASELINE}kg → {WEIGHT_TARGET}kg Lean
        </div>
        <div className="mt-1 text-[12px] text-[var(--color-text-2)]">
          8–10 months · Hybrid athlete build · Calisthenics skills + iron strength
        </div>
      </div>
      <Card>
        <CardTitle>Body Goals</CardTitle>
        <div className="mb-1 flex justify-between text-[12px] font-bold">
          <span>Weight: {WEIGHT_BASELINE}kg → {WEIGHT_TARGET}kg</span>
          <span className="font-[var(--font-mono)] text-[var(--color-blue)]">{current.toFixed(1)}kg</span>
        </div>
        <ProgressBar pct={wpct} color="var(--color-blue)" />
        <div className="font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">{wpct}% of target</div>
      </Card>
      <Card>
        <CardTitle>Skill Goals</CardTitle>
        {skills.map((s) => {
          const pct = Math.min(100, Math.round((s.val / s.target) * 100))
          return (
            <div key={s.name} className="mb-2.5 last:mb-0">
              <div className="mb-1 flex justify-between text-[12px] font-bold">
                <span>{s.name}</span>
                <span className="font-[var(--font-mono)]" style={{ color: s.color }}>{s.raw}</span>
              </div>
              <ProgressBar pct={pct} color={s.color} />
              <div className="font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">{pct}% of target</div>
            </div>
          )
        })}
      </Card>
      <Card>
        <CardTitle>🏆 Skill Unlock Tracker</CardTitle>
        <SkillUnlocks />
      </Card>
    </div>
  )
}

function SkillUnlocks() {
  const { state, setState } = useStore()
  const cycle = (key: string) =>
    setState((s) => {
      const order: Array<'locked' | 'current' | 'unlocked'> = ['locked', 'current', 'unlocked']
      const cur = s.skillUnlocks[key] ?? 'locked'
      const next = order[(order.indexOf(cur) + 1) % order.length]
      return { ...s, skillUnlocks: { ...s.skillUnlocks, [key]: next } }
    })
  const meta: Record<string, { label: string; color: string }> = {
    locked: { label: '🔒 Locked', color: 'var(--color-text-3)' },
    current: { label: '🔄 In Progress', color: 'var(--color-amber)' },
    unlocked: { label: '✅ Unlocked', color: 'var(--color-green)' },
  }
  return (
    <div>
      {SKILL_UNLOCKS.map((s) => {
        const state_ = state.skillUnlocks[s.key] ?? 'locked'
        const m = meta[state_]
        return (
          <div key={s.key} className="flex items-center gap-2.5 border-b border-[var(--color-border)] py-2.5 last:border-none">
            <span className="text-lg">{s.icon}</span>
            <span className="flex-1">
              <div className="text-[13px] font-bold">{s.name}</div>
              <div className="text-[10px] text-[var(--color-text-3)]">{s.week}</div>
            </span>
            <button
              onClick={() => cycle(s.key)}
              className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold"
              style={{ color: m.color, borderColor: `${m.color}55`, background: `${m.color}18` }}
            >
              {m.label}
            </button>
          </div>
        )
      })}
    </div>
  )
}
