import { useState } from 'react'
import { motion } from 'motion/react'
import { GlassCard, SectionTitle, Segmented, Callout, ProgressBar, Badge, Button, Toggle } from '../components/ui'
import { CountUp } from '../components/CountUp'
import { PillIcon, PlusIcon, SaladIcon } from '../components/icons'
import { DIET_PLANS, QUICK_ADD, BADGE_COLORS, type Meal } from '../data/diet'
import { DIET_TARGETS, SUPPS, getTodayCfg, type DayType } from '../data/plan'
import { useStore } from '../store/StoreContext'

type Top = 'today' | 'plan' | 'log' | 'supps'
const DAY_TABS: { value: DayType; label: string }[] = [
  { value: 'pull', label: 'Pull Day' },
  { value: 'push', label: 'Push Day' },
  { value: 'legs', label: 'Legs' },
  { value: 'sat', label: 'Sat' },
  { value: 'rest', label: 'Rest' },
]

export default function Diet() {
  const [top, setTop] = useState<Top>('today')
  return (
    <div className="px-4 pb-4">
      <Segmented
        value={top}
        onChange={setTop}
        options={[
          { value: 'today', label: 'Today' },
          { value: 'plan', label: 'Full Plan' },
          { value: 'log', label: 'Food Log' },
          { value: 'supps', label: 'Supps' },
        ]}
      />
      {top === 'today' && <TodayDiet />}
      {top === 'plan' && <FullPlan />}
      {top === 'log' && <FoodLog />}
      {top === 'supps' && <SuppsDetail />}
    </div>
  )
}

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = target ? (value / target) * 100 : 0
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-[11.5px] text-[var(--color-text-2)]">
        <span>{label}</span>
        <span className="font-[var(--font-mono)]">{value} / {target}{label === 'Calories' ? '' : 'g'}</span>
      </div>
      <ProgressBar pct={pct} color={color} />
    </div>
  )
}

function TodayDiet() {
  const { state } = useStore()
  const cfg = getTodayCfg()
  const targets = DIET_TARGETS[cfg.type]
  const plan = DIET_PLANS[cfg.type]
  const m = state.macros

  return (
    <div className="space-y-3">
      <GlassCard glow="var(--color-accent)">
        <SectionTitle>Today's Macro Targets</SectionTitle>
        <MacroBar label="Protein" value={m.p} target={targets.p} color="var(--color-accent)" />
        <MacroBar label="Carbs" value={m.c} target={targets.c} color="var(--color-amber)" />
        <MacroBar label="Fats" value={m.f} target={targets.f} color="var(--color-blue)" />
        <MacroBar label="Calories" value={m.k} target={targets.kcal} color="var(--color-green)" />
      </GlassCard>
      <Callout kind={plan.intro.kind}>{plan.intro.text}</Callout>
      <div className="space-y-2.5">
        {plan.meals.map((meal, i) => (
          <MealCard key={i} meal={meal} index={i} />
        ))}
      </div>
    </div>
  )
}

function MealCard({ meal, index = 0 }: { meal: Meal; index?: number }) {
  const bc = BADGE_COLORS[meal.badge]
  if (meal.skipped) {
    return (
      <GlassCard className="opacity-70">
        <div className="text-[13px] font-bold text-[var(--color-text-3)]">{meal.headline}</div>
        {meal.note && <div className="mt-1 text-[11.5px] leading-relaxed text-[var(--color-text-3)]">{meal.note}</div>}
      </GlassCard>
    )
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass rounded-2xl p-4"
    >
      <div className="mb-2.5 flex items-center gap-2">
        <span className="font-[var(--font-display)] text-base font-semibold tracking-tight">{meal.name}</span>
        {meal.time && <Badge color={bc.color} dim={bc.dim}>{meal.time}</Badge>}
      </div>
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <span className="text-[12.5px] font-semibold text-[var(--color-text)]">{meal.headline}</span>
        <span className="shrink-0 rounded-md bg-white/[0.04] px-1.5 py-0.5 font-[var(--font-mono)] text-[11px] text-[var(--color-text-3)]">~{meal.kcal} kcal</span>
      </div>
      {meal.ingredients.map((ing, i) => (
        <div key={i} className="flex items-start justify-between gap-2 border-b border-white/[0.05] py-2 text-[12px] last:border-none">
          <span className="text-[var(--color-text-2)]">{ing.item}</span>
          <span className="shrink-0 font-[var(--font-mono)] text-[10.5px] text-[var(--color-text-3)]">{ing.macro}</span>
        </div>
      ))}
      {meal.totals && (
        <div className="mt-2 font-[var(--font-mono)] text-[11.5px] font-bold text-[var(--color-text-2)]">{meal.totals}</div>
      )}
      {meal.note && <div className="mt-2 text-[11.5px] italic leading-relaxed text-[var(--color-text-3)]">{meal.note}</div>}
    </motion.div>
  )
}

function FullPlan() {
  const [dt, setDt] = useState<DayType>('pull')
  const plan = DIET_PLANS[dt]
  return (
    <div>
      <Segmented value={dt} onChange={setDt} options={DAY_TABS} />
      <Callout kind={plan.intro.kind}>{plan.intro.text}</Callout>
      <div className="space-y-2.5">
        {plan.meals.map((meal, i) => (
          <MealCard key={i} meal={meal} index={i} />
        ))}
      </div>
      <GlassCard glow="var(--color-green)" className="mt-3">
        <SectionTitle color="var(--color-green)">{plan.totalsLabel}</SectionTitle>
        <div className="font-[var(--font-mono)] text-[13px] font-bold leading-loose">{plan.totalsMacro}</div>
        <div className="mt-1 text-[11.5px] text-[var(--color-text-3)]">{plan.totalsBreakdown}</div>
      </GlassCard>
    </div>
  )
}

function FoodLog() {
  const { state, setState } = useStore()
  const m = state.macros

  const quickAdd = (p: number, c: number, f: number, k: number) =>
    setState((s) => ({ ...s, macros: { p: s.macros.p + p, c: s.macros.c + c, f: s.macros.f + f, k: s.macros.k + k } }))

  const reset = () => setState((s) => ({ ...s, macros: { p: 0, c: 0, f: 0, k: 0 } }))

  return (
    <div className="space-y-3">
      <GlassCard glow="var(--color-accent)">
        <SectionTitle icon={<SaladIcon width={14} height={14} />}>Daily Macro Log</SectionTitle>
        <div className="mb-3 grid grid-cols-4 gap-2 text-center">
          {[
            { l: 'kcal', v: m.k, c: 'var(--color-green)' },
            { l: 'protein', v: m.p, c: 'var(--color-accent)' },
            { l: 'carbs', v: m.c, c: 'var(--color-amber)' },
            { l: 'fats', v: m.f, c: 'var(--color-blue)' },
          ].map((x) => (
            <div key={x.l} className="rounded-lg bg-white/[0.03] py-2">
              <div className="font-[var(--font-mono)] text-sm font-extrabold" style={{ color: x.c }}>
                <CountUp value={x.v} />
              </div>
              <div className="mt-0.5 text-[8.5px] uppercase tracking-wide text-[var(--color-text-3)]">{x.l}</div>
            </div>
          ))}
        </div>
        <MacroBar label="Protein" value={m.p} target={200} color="var(--color-accent)" />
        <MacroBar label="Carbs" value={m.c} target={500} color="var(--color-amber)" />
        <MacroBar label="Fats" value={m.f} target={120} color="var(--color-blue)" />
        <MacroBar label="Calories" value={m.k} target={3900} color="var(--color-green)" />
      </GlassCard>
      <GlassCard>
        <SectionTitle>Quick Add</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ADD.map((q) => (
            <button
              key={q.name}
              onClick={() => quickAdd(q.p, q.c, q.f, q.k)}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-left transition-colors hover:bg-white/[0.06] active:scale-95"
            >
              <div className="text-[11.5px] font-bold">{q.name}</div>
              <div className="mt-0.5 font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">
                {q.k} kcal · P{q.p} C{q.c} F{q.f}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-3">
          <Button variant="ghost" full onClick={reset}>
            <PlusIcon width={13} height={13} className="rotate-45" /> Reset today's log
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}

function SuppsDetail() {
  const { state, setState } = useStore()
  const toggle = (key: string) => setState((s) => ({ ...s, supps: { ...s.supps, [key]: !s.supps[key] } }))
  return (
    <GlassCard glow="var(--color-amber)">
      <SectionTitle icon={<PillIcon width={14} height={14} />} color="var(--color-amber)">Supplement Protocol</SectionTitle>
      <Callout kind="tip">
        Timing is everything. Creatine with carbs post-workout. B12 with fat. D3 every other day with a fat meal. ZMA before sleep.
      </Callout>
      {SUPPS.map((s) => {
        const on = !!state.supps[s.key]
        return (
          <div key={s.key} className="flex items-start justify-between gap-2.5 border-b border-white/[0.06] py-3 last:border-none">
            <div>
              <div className="text-[13px] font-bold">{s.name}</div>
              <div className="mt-0.5 text-[10.5px] leading-relaxed text-[var(--color-text-3)]">{s.dose} · {s.timing}</div>
              <div className="mt-0.5 font-[var(--font-mono)] text-[10px]" style={{ color: s.color }}>{s.days}</div>
            </div>
            <Toggle on={on} onToggle={() => toggle(s.key)} />
          </div>
        )
      })}
    </GlassCard>
  )
}
