import { motion } from 'motion/react'
import { useState } from 'react'
import { Card, CardTitle, ProgressBar } from '../components/ui'
import { CheckIcon, DropletIcon, FootprintsIcon, PillIcon, BoltIcon } from '../components/icons'
import { useStore } from '../store/StoreContext'
import {
  AURA_TARGETS,
  CHECKLISTS,
  SUPPS,
  WATER_TARGET_L,
  STEPS_TARGET,
  getTodayCfg,
} from '../data/plan'

const AURA_META = [
  { key: 'hs', raw: 'hsRaw', label: 'HANDSTAND', color: 'var(--color-purple)', unit: (v: number) => `Best: ${v}s hold` },
  { key: 'mu', raw: 'muRaw', label: 'MUSCLE-UP / DIPS', color: 'var(--color-accent)', unit: (v: number) => `Best: ${v} dips` },
  { key: 'pu', raw: 'puRaw', label: 'PULL-UPS / C2B', color: 'var(--color-blue)', unit: (v: number) => `Best: ${v} pull-ups` },
  { key: 'cv', raw: 'cvRaw', label: 'CARDIO', color: 'var(--color-green)', unit: (v: number) => `Best: ${v} stair sets` },
] as const

export default function Today() {
  const { state, setState } = useStore()
  const cfg = getTodayCfg()
  const items = CHECKLISTS[cfg.type]
  const doneCount = items.filter((i) => state.checklist[i.id]).length
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0

  const cupsTotal = (WATER_TARGET_L * 1000) / 250 // 16
  const waterL = (state.water * 250) / 1000

  const [stepsInput, setStepsInput] = useState('')

  const toggleCheck = (id: string) =>
    setState((s) => ({ ...s, checklist: { ...s.checklist, [id]: !s.checklist[id] } }))

  const resetChecklist = () => setState((s) => ({ ...s, checklist: {} }))

  const toggleWaterCup = (i: number) =>
    setState((s) => ({ ...s, water: s.water === i + 1 ? i : i + 1 }))

  const toggleSupp = (key: string) =>
    setState((s) => ({ ...s, supps: { ...s.supps, [key]: !s.supps[key] } }))

  const logSteps = () => {
    const n = parseInt(stepsInput, 10)
    if (!Number.isNaN(n) && n >= 0) setState((s) => ({ ...s, steps: n }))
    setStepsInput('')
  }

  const stepsPct = Math.min(100, (state.steps / STEPS_TARGET) * 100)

  return (
    <div className="space-y-2.5 px-3 pb-4 pt-3">
      <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-3)] px-3 py-2 text-[12px] font-semibold text-[var(--color-text-2)]">
        <BoltIcon width={15} height={15} style={{ color: 'var(--color-accent)' }} />
        {cfg.label} — {doneCount}/{items.length} missions locked in
      </div>

      {/* AURA */}
      <Card>
        <CardTitle color="var(--color-purple)">
          AURA SKILLS{' '}
          <span className="ml-auto font-[var(--font-mono)] text-[10px] font-normal tracking-normal text-[var(--color-text-3)]">
            auto-synced from sessions
          </span>
        </CardTitle>
        <div className="grid grid-cols-2 gap-2.5">
          {AURA_META.map((m) => {
            const raw = state.aura[m.raw as keyof typeof state.aura] ?? 0
            const target = AURA_TARGETS[m.key as keyof typeof AURA_TARGETS]
            const p = Math.min(100, Math.round((raw / target) * 100))
            return (
              <div key={m.key} className="rounded-md bg-[var(--color-bg-3)] p-2.5">
                <div className="mb-1.5 text-[9px] font-bold tracking-wide text-[var(--color-text-2)]">{m.label}</div>
                <ProgressBar pct={p} color={m.color} />
                <div className="flex items-baseline justify-between">
                  <span className="font-[var(--font-mono)] text-xs font-extrabold" style={{ color: m.color }}>
                    {p}%
                  </span>
                  <span className="text-[9px] text-[var(--color-text-3)]">{raw ? m.unit(raw) : 'Best: —'}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-2.5 font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">
          Targets: HS 60s · Pull-ups 15 · Dips 15 · Stair sets 10
        </div>
      </Card>

      {/* CHECKLIST */}
      <Card>
        <div className="mb-2.5 flex items-center gap-2">
          <CardTitle>TODAY'S MISSIONS</CardTitle>
          <button
            onClick={resetChecklist}
            className="ml-auto rounded-md border border-[var(--color-border-2)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-2)] active:scale-95 transition-transform"
          >
            Reset
          </button>
        </div>
        <div className="mb-3 flex items-center gap-2.5">
          <div className="font-[var(--font-mono)] text-2xl font-extrabold text-[var(--color-green)]">{pct}%</div>
          <div className="flex-1">
            <ProgressBar pct={pct} color="var(--color-green)" />
            <div className="text-[10px] text-[var(--color-text-3)]">
              {doneCount} of {items.length} done
            </div>
          </div>
        </div>
        <div>
          {items.map((item) => {
            const done = !!state.checklist[item.id]
            return (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className="flex w-full items-start gap-2.5 border-b border-[var(--color-border)] py-2.5 text-left last:border-none"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors"
                  style={{
                    borderColor: done ? 'var(--color-green)' : 'var(--color-border-2)',
                    background: done ? 'var(--color-green)' : 'transparent',
                    color: '#000',
                  }}
                >
                  {done && <CheckIcon width={12} height={12} strokeWidth={3} />}
                </span>
                <span>
                  <div
                    className={`text-[13px] font-semibold leading-snug ${done ? 'text-[var(--color-text-3)] line-through font-normal' : ''}`}
                  >
                    {item.text}
                  </div>
                  <div className="mt-0.5 text-[10px] text-[var(--color-text-3)]">{item.sub}</div>
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* WATER */}
      <Card>
        <CardTitle>
          <DropletIcon width={16} height={16} style={{ color: 'var(--color-blue)' }} /> HYDRATION
        </CardTitle>
        <div className="text-center font-[var(--font-mono)] text-3xl font-extrabold text-[var(--color-blue)]">
          {waterL.toFixed(2)}L
        </div>
        <div className="mb-2 text-center text-[11px] text-[var(--color-text-3)]">
          Target: {WATER_TARGET_L}L · Each cup = 250ml
        </div>
        <ProgressBar pct={(waterL / WATER_TARGET_L) * 100} color="var(--color-blue)" />
        <div className="mt-2.5 grid grid-cols-8 gap-1.5">
          {Array.from({ length: cupsTotal }).map((_, i) => {
            const filled = i < state.water
            return (
              <button
                key={i}
                onClick={() => toggleWaterCup(i)}
                className="flex h-10 flex-col items-center justify-center rounded-md border-[1.5px] text-[15px] transition-colors"
                style={{
                  background: filled ? 'var(--color-blue-dim)' : 'var(--color-bg-3)',
                  borderColor: filled ? 'var(--color-blue)' : 'var(--color-border-2)',
                }}
              >
                <DropletIcon
                  width={14}
                  height={14}
                  style={{ color: filled ? 'var(--color-blue)' : 'var(--color-text-3)' }}
                  fill={filled ? 'var(--color-blue)' : 'none'}
                />
              </button>
            )
          })}
        </div>
      </Card>

      {/* STEPS */}
      <Card>
        <CardTitle>
          <FootprintsIcon width={16} height={16} style={{ color: 'var(--color-teal)' }} /> STEPS
        </CardTitle>
        <div className="text-center font-[var(--font-mono)] text-4xl font-extrabold text-[var(--color-teal)]">
          {state.steps.toLocaleString()}
        </div>
        <div className="mb-2 text-center text-[11px] text-[var(--color-text-3)]">
          Target: {STEPS_TARGET.toLocaleString()} daily (Zone 2 baseline)
        </div>
        <ProgressBar pct={stepsPct} color="var(--color-teal)" />
        <div className="mt-2.5 flex gap-2">
          <input
            type="number"
            value={stepsInput}
            onChange={(e) => setStepsInput(e.target.value)}
            placeholder="Enter steps"
            className="flex-1 rounded-md border border-[var(--color-border-2)] bg-[var(--color-bg-3)] px-2.5 py-2 font-[var(--font-mono)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          />
          <button
            onClick={logSteps}
            className="rounded-md border border-[var(--color-border-2)] px-3.5 text-[11px] font-semibold text-[var(--color-text-2)] active:scale-95 transition-transform"
          >
            Update
          </button>
        </div>
      </Card>

      {/* SUPPLEMENTS */}
      <Card>
        <CardTitle>
          <PillIcon width={16} height={16} style={{ color: 'var(--color-amber)' }} /> SUPPLEMENTS
        </CardTitle>
        <div>
          {SUPPS.map((s) => {
            const on = !!state.supps[s.key]
            return (
              <div key={s.key} className="flex items-start justify-between gap-2.5 border-b border-[var(--color-border)] py-2.5 last:border-none">
                <div>
                  <div className="text-[13px] font-bold">{s.name}</div>
                  <div className="mt-0.5 text-[10px] leading-relaxed text-[var(--color-text-3)]">
                    {s.dose} · {s.timing}
                  </div>
                  <div className="mt-0.5 font-[var(--font-mono)] text-[10px]" style={{ color: s.color }}>
                    {s.days}
                  </div>
                </div>
                <button
                  onClick={() => toggleSupp(s.key)}
                  className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors"
                  style={{ background: on ? 'var(--color-green)' : 'var(--color-bg-4)' }}
                  aria-pressed={on}
                >
                  <motion.span
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                    animate={{ left: on ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
