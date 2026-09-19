import { useEffect, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { GlassCard, SectionTitle, Segmented, Callout, Divider, mix } from '../components/ui'
import { ChevronDownIcon, ClockIcon, ShieldIcon, HeartIcon, SparklesIcon, DumbbellIcon, TrendingUpIcon } from '../components/icons'
import { SPLIT, HS_LADDER, MU_LADDER, HR_ZONES, LAWS } from '../data/workouts'
import { TIMELINES, getTodayDow, getTodayCfg, calcAge, getHRMax } from '../data/plan'
import { MESOCYCLE, getCurrentMesoWeek } from '../data/periodization'

type Top = 'timeline' | 'workout'
type Sub = 'split' | 'skills' | 'cardio' | 'laws'

export default function Train() {
  const [top, setTop] = useState<Top>('timeline')
  const [sub, setSub] = useState<Sub>('split')

  return (
    <div className="px-4 pb-4">
      <Segmented
        value={top}
        onChange={setTop}
        options={[
          { value: 'timeline', label: 'Timeline' },
          { value: 'workout', label: 'Workout' },
        ]}
      />
      {top === 'timeline' ? (
        <TimelineView />
      ) : (
        <div>
          <MesocycleBanner />
          <Segmented
            value={sub}
            onChange={setSub}
            options={[
              { value: 'split', label: 'Split' },
              { value: 'skills', label: 'Skills' },
              { value: 'cardio', label: 'Cardio' },
              { value: 'laws', label: 'Laws' },
            ]}
          />
          {sub === 'split' && <SplitView />}
          {sub === 'skills' && <SkillsView />}
          {sub === 'cardio' && <CardioView />}
          {sub === 'laws' && <LawsView />}
        </div>
      )}
    </div>
  )
}

function MesocycleBanner() {
  const current = getCurrentMesoWeek()
  return (
    <GlassCard glow={current.color} className="mb-4">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: mix(current.color, 16), color: current.color }}>
          <TrendingUpIcon width={15} height={15} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-[var(--font-mono)] text-[9.5px] font-bold uppercase tracking-[1.5px]" style={{ color: current.color }}>
            Mesocycle · Week {current.week} of 4
          </div>
          <div className="font-[var(--font-display)] text-[15px] font-semibold tracking-tight">{current.name}</div>
        </div>
        <div className="flex shrink-0 gap-1">
          {MESOCYCLE.map((w) => (
            <span
              key={w.week}
              className="h-1.5 w-5 rounded-full"
              style={{ background: w.week === current.week ? current.color : 'rgba(255,255,255,0.1)' }}
            />
          ))}
        </div>
      </div>
      <div className="mb-3 text-[12px] leading-relaxed text-[var(--color-text-2)]">{current.focus}</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/[0.03] p-2">
          <div className="text-[9px] font-semibold uppercase tracking-wide text-[var(--color-text-3)]">Reps</div>
          <div className="mt-0.5 text-[11px] font-medium">{current.repGuidance}</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-2">
          <div className="text-[9px] font-semibold uppercase tracking-wide text-[var(--color-text-3)]">Rest</div>
          <div className="mt-0.5 text-[11px] font-medium">{current.restGuidance}</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-2">
          <div className="text-[9px] font-semibold uppercase tracking-wide text-[var(--color-text-3)]">Target</div>
          <div className="mt-0.5 text-[11px] font-medium">{current.rpeTarget}</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-2">
          <div className="text-[9px] font-semibold uppercase tracking-wide text-[var(--color-text-3)]">Load</div>
          <div className="mt-0.5 text-[11px] font-medium leading-snug">{current.loadNote}</div>
        </div>
      </div>
    </GlassCard>
  )
}

function parseClock(t: string): number {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return -1
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  const ampm = m[3].toUpperCase()
  if (ampm === 'AM' && h === 12) h = 0
  if (ampm === 'PM' && h !== 12) h += 12
  return h * 60 + min
}

function TimelineView() {
  const dow = getTodayDow()
  const cfg = getTodayCfg()
  const events = TIMELINES[cfg.type]
  const typeColor: Record<string, string> = {
    work: 'var(--color-text-3)',
    meal: 'var(--color-amber)',
    skill: 'var(--color-purple)',
    gym: 'var(--color-blue)',
    sleep: 'var(--color-text-3)',
  }

  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  let currentIdx = -1
  events.forEach((e, i) => {
    if (parseClock(e.t) <= nowMinutes) currentIdx = i
  })

  return (
    <GlassCard>
      <SectionTitle icon={<ClockIcon width={15} height={15} />} trailing={<span className="font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">{dow} · {cfg.label}</span>}>
        Today's Schedule
      </SectionTitle>
      <div className="relative pl-5">
        <div className="absolute left-[6px] top-1 bottom-1 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />
        {events.map((e, i) => {
          const isNow = i === currentIdx
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="relative pb-5 last:pb-0"
            >
              {isNow && (
                <motion.div
                  layoutId="timeline-now"
                  className="absolute -left-3 -right-2 -top-1.5 -bottom-1 rounded-xl"
                  style={{ background: mix(typeColor[e.type], 10), border: `1px solid ${mix(typeColor[e.type], 30)}` }}
                />
              )}
              <span className="absolute -left-5 top-1 flex h-3 w-3 items-center justify-center">
                {isNow && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: typeColor[e.type] }} />}
                <span className="relative h-3 w-3 rounded-full border-2" style={{ background: typeColor[e.type], borderColor: 'var(--color-bg-soft)' }} />
              </span>
              <div className="relative flex items-baseline gap-2">
                <span className="font-[var(--font-mono)] text-[10px] font-bold text-[var(--color-text-3)]">{e.t}</span>
                <span className="text-[13px] font-bold">{e.label}</span>
                {isNow && (
                  <span
                    className="rounded-full px-1.5 py-0.5 font-[var(--font-mono)] text-[8.5px] font-bold uppercase tracking-wide"
                    style={{ background: typeColor[e.type], color: '#04150c' }}
                  >
                    Now
                  </span>
                )}
              </div>
              <div className="relative mt-0.5 text-[11.5px] leading-relaxed text-[var(--color-text-2)]">{e.note}</div>
            </motion.div>
          )
        })}
      </div>
    </GlassCard>
  )
}

function SplitView() {
  const todayDow = getTodayDow()
  const [open, setOpen] = useState<string | null>(todayDow)
  return (
    <div className="space-y-2.5">
      {SPLIT.map((day) => {
        const isOpen = open === day.dow
        return (
          <GlassCard key={day.dow} className="!p-0" glow={isOpen ? day.color : undefined}>
            <button
              onClick={() => setOpen(isOpen ? null : day.dow)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <span className="w-10 font-[var(--font-display)] text-sm font-bold tracking-wide" style={{ color: day.color }}>
                {day.dow}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold">{day.emoji} {day.title}</div>
                <div className="mt-0.5 font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">{day.subtitle}</div>
              </div>
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0 text-[var(--color-text-3)]">
                <ChevronDownIcon width={15} height={15} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden border-t border-white/[0.06]"
                >
                  <div className="px-4 py-4">
                    <Callout kind={day.banner.kind}>{day.banner.text}</Callout>
                    {day.blocks.map((block, bi) => (
                      <div key={bi} className="mt-4 first:mt-0">
                        <div className="mb-2 font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--color-text-3)]" style={block.color ? { color: block.color } : undefined}>
                          {block.heading}
                        </div>
                        {block.exercises.map((ex, ei) => (
                          <div key={ei} className="flex items-center justify-between gap-2 border-b border-white/[0.05] py-2 text-[12.5px] text-[var(--color-text-2)] last:border-none">
                            <span>{ex.name}</span>
                            <span className="shrink-0 rounded-md bg-white/[0.04] px-1.5 py-0.5 font-[var(--font-mono)] text-[11px] text-[var(--color-text-3)]">{ex.sets}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        )
      })}
    </div>
  )
}

function SkillsView() {
  return (
    <div className="space-y-3">
      <GlassCard glow="var(--color-purple)">
        <div className="mb-1 flex items-center gap-1.5 font-[var(--font-mono)] text-[10px] font-bold tracking-[1.5px] text-[var(--color-purple)]">
          <SparklesIcon width={12} height={12} /> AURA FARMING ROADMAP
        </div>
        <div className="font-[var(--font-display)] text-lg font-semibold tracking-tight">Handstand → Muscle-Up → L-Sit → Front Lever</div>
        <div className="mt-1 text-[12px] text-[var(--color-text-2)]">
          Master the foundation before the peak. Each unlock = permanent aura upgrade.
        </div>
      </GlassCard>
      <SkillLadder title="Handstand Ladder" icon={<SparklesIcon width={15} height={15} />} color="var(--color-purple)" steps={HS_LADDER} />
      <SkillLadder title="Muscle-Up Ladder" icon={<DumbbellIcon width={15} height={15} />} color="var(--color-accent)" steps={MU_LADDER} />
    </div>
  )
}

function SkillLadder({ title, icon, color, steps }: { title: string; icon: ReactNode; color: string; steps: typeof HS_LADDER }) {
  return (
    <GlassCard glow={color}>
      <SectionTitle icon={icon} color={color}>{title}</SectionTitle>
      <div className="relative space-y-4 pl-1">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/10" />
        {steps.map((s) => (
          <div key={s.num} className="relative flex gap-3">
            <div
              className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-[var(--font-mono)] text-[11px] font-bold"
              style={{ background: mix(color, 22), color, border: `1px solid ${mix(color, 44)}` }}
            >
              {s.num}
            </div>
            <div className="pt-1">
              <div className="text-[12.5px] font-bold" style={s.highlight ? { color: 'var(--color-teal)' } : undefined}>
                {s.name}
              </div>
              <div className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--color-text-2)]">{s.desc}</div>
              <div className="mt-0.5 font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">{s.target}</div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

function CardioView() {
  const age = calcAge()
  const max = getHRMax()
  return (
    <div className="space-y-3">
      <GlassCard glow="var(--color-green)">
        <SectionTitle icon={<HeartIcon width={15} height={15} />} color="var(--color-green)">Cardiovascular Blueprint</SectionTitle>
        <div className="text-[12.5px] leading-relaxed text-[var(--color-text-2)]">
          Two zones required. Zone 2 = builds the engine. Zone 4/5 = sharpens the weapon.
        </div>
      </GlassCard>
      <GlassCard>
        <SectionTitle>Zone 2 — Aerobic Base</SectionTitle>
        <Callout kind="tip">
          Zone 2 = hold a conversation, can't sing. HR ~{Math.round(max * 0.59)}–{Math.round(max * 0.66)} BPM. Burns fat, builds mitochondria, improves recovery.
        </Callout>
        <ul className="space-y-2 text-[12.5px] text-[var(--color-text-2)]">
          <li>Zone 2 walk on Pull days — 15 min, 10–12% grade, evening after office.</li>
          <li>Morning walk before Meal 1 (Sun, optional) — 20 min fasted.</li>
          <li>8,000 steps daily. Baseline Zone 2 volume.</li>
        </ul>
      </GlassCard>
      <GlassCard>
        <SectionTitle>Zone 4–5 — HIIT</SectionTitle>
        <Callout kind="danger">
          Zone 4/5 = cannot speak. HR ~{Math.round(max * 0.73)}–{Math.round(max * 0.85)} BPM. Improves VO2 max, cardiac output.
        </Callout>
        <ul className="space-y-2 text-[12.5px] text-[var(--color-text-2)]">
          <li>Tuesday: 6 rounds × 60s jump rope / stair sprints, 60s rest.</li>
          <li>Saturday: 5 rounds stair sprints — 2 min hard, 1 min rest. Peak intensity.</li>
        </ul>
      </GlassCard>
      <GlassCard>
        <SectionTitle>Heart Rate Zones ({age}yo, Max ~{max})</SectionTitle>
        <div className="grid grid-cols-5 gap-1.5">
          {HR_ZONES.map((z) => (
            <div key={z.z} className="rounded-lg px-1 py-2.5 text-center" style={{ background: mix(z.color, 18), border: `1px solid ${mix(z.color, 40)}` }}>
              <div className="font-[var(--font-mono)] text-[11px] font-extrabold" style={{ color: z.color }}>{z.z}</div>
              <div className="mt-1 font-[var(--font-mono)] text-[9.5px]" style={{ color: z.color }}>{z.calc(max)}</div>
              <div className="mt-0.5 text-[8px] text-[var(--color-text-3)]">{z.label}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

function LawsView() {
  return (
    <GlassCard glow="var(--color-accent)">
      <SectionTitle icon={<ShieldIcon width={15} height={15} />} color="var(--color-accent)">The 12 Laws of God Mode</SectionTitle>
      <div className="space-y-3">
        {LAWS.map((l) => (
          <div key={l.n}>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-dim)] font-[var(--font-mono)] text-[10px] font-bold text-[var(--color-accent)]">
                {l.n}
              </span>
              <span className="pt-0.5 text-[12.5px] leading-relaxed text-[var(--color-text-2)]">{l.text}</span>
            </div>
            {l.n !== LAWS.length && <Divider />}
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
