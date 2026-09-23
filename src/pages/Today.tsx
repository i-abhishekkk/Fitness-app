import { motion } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GlassCard, SectionTitle, ProgressBar, TextField } from '../components/ui'
import { CountUp } from '../components/CountUp'
import { CheckIcon, DropletIcon, FootprintsIcon, PillIcon, BoltIcon, SparklesIcon, BotIcon } from '../components/icons'
import { useStore } from '../store/StoreContext'
import { pushActivity } from '../store/appState'
import { haptic } from '../lib/haptics'
import {
  AURA_TARGETS,
  CHECKLISTS,
  SUPPS,
  WATER_TARGET_L,
  STEPS_TARGET,
  getTodayCfg,
} from '../data/plan'

const AURA_META = [
  { key: 'hs', raw: 'hsRaw', label: 'Handstand', color: 'var(--color-purple)', unit: (v: number) => `Best ${v}s hold` },
  { key: 'mu', raw: 'muRaw', label: 'Muscle-up / Dips', color: 'var(--color-accent)', unit: (v: number) => `Best ${v} dips` },
  { key: 'pu', raw: 'puRaw', label: 'Pull-ups / C2B', color: 'var(--color-blue)', unit: (v: number) => `Best ${v} pull-ups` },
  { key: 'cv', raw: 'cvRaw', label: 'Cardio', color: 'var(--color-green)', unit: (v: number) => `Best ${v} stair sets` },
] as const

const STALE_AFTER_DAYS = 9

function WeeklyReviewCard() {
  const { state } = useStore()
  const review = state.weeklyReview
  if (!review) return null
  const ageDays = (Date.now() - new Date(review.generatedAt).getTime()) / 86_400_000
  if (ageDays > STALE_AFTER_DAYS) return null

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard glow="var(--color-purple)">
        <SectionTitle icon={<BotIcon width={14} height={14} />} color="var(--color-purple)" trailing={
          <span className="font-[var(--font-mono)] text-[9px] text-[var(--color-text-3)]">{new Date(review.generatedAt).toLocaleDateString()}</span>
        }>
          Your Weekly Review
        </SectionTitle>
        <div className="text-[12.5px] leading-relaxed text-[var(--color-text-2)]">{review.text}</div>
      </GlassCard>
    </motion.div>
  )
}

export default function Today() {
  const { state, setState } = useStore()
  const cfg = getTodayCfg()
  const items = CHECKLISTS[cfg.type]
  const doneCount = items.filter((i) => state.checklist[i.id]).length
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0

  const cupsTotal = (WATER_TARGET_L * 1000) / 250
  const waterL = (state.water * 250) / 1000

  const [stepsInput, setStepsInput] = useState('')

  const toggleCheck = (id: string) => {
    haptic()
    const wasDone = !!state.checklist[id]
    setState((s) => ({ ...s, checklist: { ...s.checklist, [id]: !s.checklist[id] } }))
    if (!wasDone) {
      const item = items.find((i) => i.id === id)
      if (item) pushActivity(setState, '✅', item.text)
    }
  }

  const resetChecklist = () => setState((s) => ({ ...s, checklist: {} }))

  const toggleWaterCup = (i: number) => {
    haptic(6)
    const next = state.water === i + 1 ? i : i + 1
    setState((s) => ({ ...s, water: next }))
    if (next > state.water) pushActivity(setState, '💧', `Logged water — ${((next * 250) / 1000).toFixed(2)}L (${next} cup${next !== 1 ? 's' : ''} today)`)
  }

  const logSteps = () => {
    const n = parseInt(stepsInput, 10)
    if (!Number.isNaN(n) && n >= 0) {
      setState((s) => ({ ...s, steps: n }))
      pushActivity(setState, '👟', `Logged ${n.toLocaleString()} steps`)
    }
    setStepsInput('')
  }

  const stepsPct = Math.min(100, (state.steps / STEPS_TARGET) * 100)

  return (
    <div className="space-y-3 px-4 pb-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[12px] font-semibold text-[var(--color-text-2)]"
      >
        <BoltIcon width={15} height={15} style={{ color: 'var(--color-accent)' }} />
        {cfg.label} — {doneCount}/{items.length} missions locked in
      </motion.div>

      <WeeklyReviewCard />

      {/* AURA */}
      <GlassCard glow="var(--color-purple)">
        <SectionTitle icon={<SparklesIcon width={15} height={15} />} color="var(--color-purple)" trailing={<span className="font-[var(--font-mono)] text-[9.5px] text-[var(--color-text-3)]">auto-synced</span>}>
          Aura Skills
        </SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          {AURA_META.map((m) => {
            const raw = state.aura[m.raw as keyof typeof state.aura] ?? 0
            const target = AURA_TARGETS[m.key as keyof typeof AURA_TARGETS]
            const p = Math.min(100, Math.round((raw / target) * 100))
            return (
              <div key={m.key} className="rounded-xl bg-white/[0.03] p-3">
                <div className="mb-2 text-[10px] font-semibold text-[var(--color-text-2)]">{m.label}</div>
                <ProgressBar pct={p} color={m.color} />
                <div className="flex items-baseline justify-between">
                  <span className="font-[var(--font-mono)] text-xs font-extrabold" style={{ color: m.color }}>
                    <CountUp value={p} suffix="%" />
                  </span>
                  <span className="text-[9px] text-[var(--color-text-3)]">{raw ? m.unit(raw) : 'Best —'}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-3 font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">
          Targets · HS 60s · Pull-ups 15 · Dips 15 · Stair sets 10
        </div>
      </GlassCard>

      {/* CHECKLIST */}
      <GlassCard>
        <SectionTitle trailing={
          <button onClick={resetChecklist} className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-2)] transition-colors hover:bg-white/5">
            Reset
          </button>
        }>
          Today's Missions
        </SectionTitle>
        <div className="mb-4 flex items-center gap-3">
          <div className="font-[var(--font-mono)] text-3xl font-extrabold text-[var(--color-green)]">
            <CountUp value={pct} suffix="%" />
          </div>
          <div className="flex-1">
            <ProgressBar pct={pct} color="var(--color-green)" />
            <div className="text-[10px] text-[var(--color-text-3)]">{doneCount} of {items.length} done</div>
          </div>
        </div>
        <div>
          {items.map((item, i) => {
            const done = !!state.checklist[item.id]
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => toggleCheck(item.id)}
                className="flex w-full items-start gap-3 border-b border-white/[0.06] py-3 text-left last:border-none"
              >
                <motion.span
                  animate={{ scale: done ? [1, 1.15, 1] : 1 }}
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors"
                  style={{
                    borderColor: done ? 'var(--color-green)' : 'var(--color-border-2)',
                    background: done ? 'var(--color-green)' : 'transparent',
                    color: '#04150c',
                  }}
                >
                  {done && <CheckIcon width={12} height={12} strokeWidth={3} />}
                </motion.span>
                <span>
                  <div className={`text-[13px] font-semibold leading-snug transition-colors ${done ? 'text-[var(--color-text-3)] line-through font-normal' : ''}`}>
                    {item.text}
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-[var(--color-text-3)]">{item.sub}</div>
                </span>
              </motion.button>
            )
          })}
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        {/* WATER */}
        <GlassCard glow="var(--color-blue)">
          <SectionTitle icon={<DropletIcon width={14} height={14} />} color="var(--color-blue)">Hydration</SectionTitle>
          <div className="text-center font-[var(--font-mono)] text-2xl font-extrabold text-[var(--color-blue)]">
            <CountUp value={waterL} decimals={2} suffix="L" />
          </div>
          <div className="mb-2 text-center text-[10px] text-[var(--color-text-3)]">of {WATER_TARGET_L}L target</div>
          <ProgressBar pct={(waterL / WATER_TARGET_L) * 100} color="var(--color-blue)" />
          <div className="mt-2.5 grid grid-cols-4 gap-1.5">
            {Array.from({ length: cupsTotal }).map((_, i) => {
              const filled = i < state.water
              return (
                <button
                  key={i}
                  onClick={() => toggleWaterCup(i)}
                  className="flex aspect-square items-center justify-center rounded-lg border-[1.5px] transition-colors"
                  style={{
                    background: filled ? 'var(--color-blue-dim)' : 'rgba(255,255,255,0.03)',
                    borderColor: filled ? 'var(--color-blue)' : 'var(--color-border-2)',
                  }}
                >
                  <DropletIcon width={12} height={12} style={{ color: filled ? 'var(--color-blue)' : 'var(--color-text-3)' }} fill={filled ? 'var(--color-blue)' : 'none'} />
                </button>
              )
            })}
          </div>
        </GlassCard>

        {/* STEPS */}
        <GlassCard glow="var(--color-teal)">
          <SectionTitle icon={<FootprintsIcon width={14} height={14} />} color="var(--color-teal)">Steps</SectionTitle>
          <div className="text-center font-[var(--font-mono)] text-2xl font-extrabold text-[var(--color-teal)]">
            <CountUp value={state.steps} />
          </div>
          <div className="mb-2 text-center text-[10px] text-[var(--color-text-3)]">of {STEPS_TARGET.toLocaleString()} target</div>
          <ProgressBar pct={stepsPct} color="var(--color-teal)" />
          <div className="mt-2.5 flex gap-1.5">
            <TextField
              type="number"
              value={stepsInput}
              onChange={(e) => setStepsInput(e.target.value)}
              placeholder="Steps"
              className="px-2.5 py-2 text-xs"
            />
            <button onClick={logSteps} className="shrink-0 rounded-xl border border-white/10 px-3 text-[11px] font-semibold text-[var(--color-text-2)] active:scale-95 transition-transform">
              Set
            </button>
          </div>
        </GlassCard>
      </div>

      {/* SUPPLEMENTS — full toggle list lives in Diet > Supps only, this is just a status link */}
      <Link to="/diet">
        <GlassCard glow="var(--color-amber)" className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: 'var(--color-amber-dim)', color: 'var(--color-amber)' }}>
            <PillIcon width={16} height={16} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-bold">Supplements</div>
            <div className="text-[10.5px] text-[var(--color-text-3)]">
              {SUPPS.filter((s) => state.supps[s.key]).length}/{SUPPS.length} taken today · manage in Diet
            </div>
          </div>
          <span className="text-[var(--color-text-3)]">→</span>
        </GlassCard>
      </Link>
    </div>
  )
}
