import { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardTitle, Segmented, Callout, ProgressBar, Badge } from '../components/ui'
import { PillIcon, PlusIcon } from '../components/icons'
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
    <div className="px-3 pb-4 pt-3">
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
    <div className="mb-2.5 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-[11px] text-[var(--color-text-2)]">
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
    <div className="space-y-2.5">
      <Card>
        <CardTitle>Today's Macro Targets</CardTitle>
        <MacroBar label="Protein" value={m.p} target={targets.p} color="var(--color-accent)" />
        <MacroBar label="Carbs" value={m.c} target={targets.c} color="var(--color-amber)" />
        <MacroBar label="Fats" value={m.f} target={targets.f} color="var(--color-blue)" />
        <MacroBar label="Calories" value={m.k} target={targets.kcal} color="var(--color-green)" />
      </Card>
      <Callout kind={plan.intro.kind}>{plan.intro.text}</Callout>
      <div className="space-y-2">
        {plan.meals.map((meal, i) => (
          <MealCard key={i} meal={meal} />
        ))}
      </div>
    </div>
  )
}

function MealCard({ meal }: { meal: Meal }) {
  const bc = BADGE_COLORS[meal.badge]
  if (meal.skipped) {
    return (
      <Card>
        <div className="text-[13px] font-bold text-[var(--color-text-3)]">{meal.headline}</div>
        {meal.note && <div className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-3)]">{meal.note}</div>}
      </Card>
    )
  }
  return (
    <Card>
      <div className="mb-2 flex items-center gap-2">
        <span className="font-[var(--font-display)] text-base tracking-wide">{meal.name}</span>
        {meal.time && <Badge color={bc.color} dim={bc.dim}>{meal.time}</Badge>}
      </div>
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-[12px] font-semibold text-[var(--color-text)]">{meal.headline}</span>
        <span className="shrink-0 font-[var(--font-mono)] text-[11px] text-[var(--color-text-3)]">~{meal.kcal} kcal</span>
      </div>
      {meal.ingredients.map((ing, i) => (
        <div key={i} className="flex items-start justify-between gap-2 border-b border-[var(--color-border)] py-1.5 text-[11.5px] last:border-none">
          <span className="text-[var(--color-text-2)]">{ing.item}</span>
          <span className="shrink-0 font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">{ing.macro}</span>
        </div>
      ))}
      {meal.totals && (
        <div className="mt-1.5 font-[var(--font-mono)] text-[11px] font-bold text-[var(--color-text-2)]">{meal.totals}</div>
      )}
      {meal.note && <div className="mt-1.5 text-[11px] italic leading-relaxed text-[var(--color-text-3)]">{meal.note}</div>}
    </Card>
  )
}

function FullPlan() {
  const [dt, setDt] = useState<DayType>('pull')
  const plan = DIET_PLANS[dt]
  return (
    <div>
      <Segmented value={dt} onChange={setDt} options={DAY_TABS} />
      <Callout kind={plan.intro.kind}>{plan.intro.text}</Callout>
      <div className="space-y-2">
        {plan.meals.map((meal, i) => (
          <MealCard key={i} meal={meal} />
        ))}
      </div>
      <Card accent="var(--color-green)" className="mt-2">
        <CardTitle color="var(--color-green)">{plan.totalsLabel}</CardTitle>
        <div className="font-[var(--font-mono)] text-[13px] font-bold leading-loose">{plan.totalsMacro}</div>
        <div className="mt-1 text-[11px] text-[var(--color-text-3)]">{plan.totalsBreakdown}</div>
      </Card>
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
    <div className="space-y-2.5">
      <Card>
        <CardTitle>Daily Macro Log</CardTitle>
        <MacroBar label="Protein" value={m.p} target={200} color="var(--color-accent)" />
        <MacroBar label="Carbs" value={m.c} target={500} color="var(--color-amber)" />
        <MacroBar label="Fats" value={m.f} target={120} color="var(--color-blue)" />
        <MacroBar label="Calories" value={m.k} target={3900} color="var(--color-green)" />
      </Card>
      <Card>
        <CardTitle>Food Log</CardTitle>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ADD.map((q) => (
            <button
              key={q.name}
              onClick={() => quickAdd(q.p, q.c, q.f, q.k)}
              className="rounded-md border border-[var(--color-border-2)] bg-[var(--color-bg-3)] p-2 text-left active:scale-95 transition-transform"
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span>{q.name}</span>
              </div>
              <div className="mt-0.5 font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">
                {q.k} kcal · P{q.p} C{q.c} F{q.f}
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={reset}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-[var(--color-border-2)] py-2 text-[11px] font-semibold text-[var(--color-text-2)] active:scale-95 transition-transform"
        >
          <PlusIcon width={13} height={13} className="rotate-45" /> Reset today's log
        </button>
      </Card>
    </div>
  )
}

function SuppsDetail() {
  const { state, setState } = useStore()
  const toggle = (key: string) => setState((s) => ({ ...s, supps: { ...s.supps, [key]: !s.supps[key] } }))
  return (
    <Card>
      <CardTitle>
        <PillIcon width={16} height={16} style={{ color: 'var(--color-amber)' }} /> Supplement Protocol
      </CardTitle>
      <Callout kind="tip">
        Timing is everything. Creatine with carbs post-workout. B12 with fat. D3 every other day with a fat meal. ZMA before sleep.
      </Callout>
      {SUPPS.map((s) => {
        const on = !!state.supps[s.key]
        return (
          <div key={s.key} className="flex items-start justify-between gap-2.5 border-b border-[var(--color-border)] py-2.5 last:border-none">
            <div>
              <div className="text-[13px] font-bold">{s.name}</div>
              <div className="mt-0.5 text-[10px] leading-relaxed text-[var(--color-text-3)]">{s.dose} · {s.timing}</div>
              <div className="mt-0.5 font-[var(--font-mono)] text-[10px]" style={{ color: s.color }}>{s.days}</div>
            </div>
            <button
              onClick={() => toggle(s.key)}
              className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors"
              style={{ background: on ? 'var(--color-green)' : 'var(--color-bg-4)' }}
            >
              <motion.span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow" animate={{ left: on ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 32 }} />
            </button>
          </div>
        )
      })}
    </Card>
  )
}
