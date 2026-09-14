import { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardTitle, Segmented, Callout } from '../components/ui'
import { ChevronDownIcon } from '../components/icons'
import { SPLIT, HS_LADDER, MU_LADDER, HR_ZONES, LAWS } from '../data/workouts'
import { TIMELINES, getTodayDow, getTodayCfg, calcAge, getHRMax } from '../data/plan'

type Top = 'timeline' | 'workout'
type Sub = 'split' | 'skills' | 'cardio' | 'laws'

export default function Train() {
  const [top, setTop] = useState<Top>('timeline')
  const [sub, setSub] = useState<Sub>('split')

  return (
    <div className="px-3 pb-4 pt-3">
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
  return (
    <Card>
      <CardTitle>
        TODAY'S SCHEDULE
        <span className="ml-auto font-[var(--font-mono)] text-[10px] font-normal text-[var(--color-text-3)]">
          {dow} · {cfg.label}
        </span>
      </CardTitle>
      <div className="relative pl-4">
        <div className="absolute left-[5px] top-1 bottom-1 w-px bg-[var(--color-border-2)]" />
        {events.map((e, i) => (
          <div key={i} className="relative pb-4 last:pb-0">
            <span
              className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-bg-2)]"
              style={{ background: typeColor[e.type] }}
            />
            <div className="flex items-baseline gap-2">
              <span className="font-[var(--font-mono)] text-[10px] font-bold text-[var(--color-text-3)]">{e.t}</span>
              <span className="text-[13px] font-bold">{e.label}</span>
            </div>
            <div className="mt-0.5 text-[11px] leading-relaxed text-[var(--color-text-2)]">{e.note}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function SplitView() {
  const todayDow = getTodayDow()
  const [open, setOpen] = useState<string | null>(todayDow)
  return (
    <div className="space-y-2">
      {SPLIT.map((day) => {
        const isOpen = open === day.dow
        return (
          <div key={day.dow} className="overflow-hidden rounded-[10px] border border-[var(--color-border)]">
            <button
              onClick={() => setOpen(isOpen ? null : day.dow)}
              className="flex w-full items-center gap-2.5 bg-[var(--color-bg-3)] px-3 py-2.5 text-left"
            >
              <span className="w-9 font-[var(--font-display)] text-sm tracking-wide" style={{ color: day.color }}>
                {day.dow}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold">{day.emoji} {day.title}</div>
                <div className="mt-0.5 font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">{day.subtitle}</div>
              </div>
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0 text-[var(--color-text-3)]">
                <ChevronDownIcon width={14} height={14} />
              </motion.span>
            </button>
            {isOpen && (
              <div className="border-t border-[var(--color-border)]">
                <div className="px-3 py-3">
                  <Callout kind={day.banner.kind}>{day.banner.text}</Callout>
                  {day.blocks.map((block, bi) => (
                    <div key={bi} className="mt-3 first:mt-0">
                      <div
                        className="mb-1.5 font-[var(--font-mono)] text-[9px] font-bold uppercase tracking-[1.2px] text-[var(--color-text-3)]"
                        style={block.color ? { color: block.color } : undefined}
                      >
                        {block.heading}
                      </div>
                      {block.exercises.map((ex, ei) => (
                        <div
                          key={ei}
                          className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] py-1.5 text-[12px] text-[var(--color-text-2)] last:border-none"
                        >
                          <span>{ex.name}</span>
                          <span className="shrink-0 font-[var(--font-mono)] text-[11px] text-[var(--color-text-3)]">{ex.sets}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SkillsView() {
  return (
    <div className="space-y-2.5">
      <Card className="border-l-[3px]" accent="var(--color-purple)">
        <div className="mb-1 font-[var(--font-mono)] text-[10px] font-bold tracking-[1.5px] text-[var(--color-purple)]">
          AURA FARMING ROADMAP
        </div>
        <div className="font-[var(--font-display)] text-lg tracking-wide">Handstand → Muscle-Up → L-Sit → Front Lever</div>
        <div className="mt-1 text-[12px] text-[var(--color-text-2)]">
          Master the foundation before the peak. Each unlock = permanent aura upgrade.
        </div>
      </Card>
      <SkillLadder title="HANDSTAND LADDER" icon="🤸" color="var(--color-purple)" steps={HS_LADDER} />
      <SkillLadder title="MUSCLE-UP LADDER" icon="💪" color="var(--color-accent)" steps={MU_LADDER} />
    </div>
  )
}

function SkillLadder({ title, icon, color, steps }: { title: string; icon: string; color: string; steps: typeof HS_LADDER }) {
  return (
    <Card accent={color}>
      <CardTitle color={color}>{icon} {title}</CardTitle>
      <div className="space-y-3">
        {steps.map((s) => (
          <div key={s.num} className="flex gap-2.5">
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-[var(--font-mono)] text-[11px] font-bold"
              style={{ background: `${color}22`, color }}
            >
              {s.num}
            </div>
            <div>
              <div className="text-[12.5px] font-bold" style={s.highlight ? { color: 'var(--color-teal)' } : undefined}>
                {s.name}
              </div>
              <div className="mt-0.5 text-[11px] leading-relaxed text-[var(--color-text-2)]">{s.desc}</div>
              <div className="mt-0.5 font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">{s.target}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function CardioView() {
  const age = calcAge()
  const max = getHRMax()
  return (
    <div className="space-y-2.5">
      <Card accent="var(--color-green)">
        <CardTitle color="var(--color-green)">🫀 Cardiovascular Blueprint</CardTitle>
        <div className="text-[12px] leading-relaxed text-[var(--color-text-2)]">
          Two zones required. Zone 2 = builds the engine. Zone 4/5 = sharpens the weapon.
        </div>
      </Card>
      <Card>
        <CardTitle>Zone 2 — Aerobic Base</CardTitle>
        <Callout kind="tip">
          Zone 2 = hold a conversation, can't sing. HR ~{Math.round(max * 0.59)}–{Math.round(max * 0.66)} BPM. Burns fat, builds mitochondria, improves recovery.
        </Callout>
        <ul className="space-y-1.5 text-[12px] text-[var(--color-text-2)]">
          <li>Incline treadmill walk post-Pull day (Mon) — 15 min, 10–12% grade.</li>
          <li>Morning walk before M1 (Sun, optional) — 20 min fasted.</li>
          <li>8,000 steps daily. Baseline Zone 2 volume.</li>
        </ul>
      </Card>
      <Card>
        <CardTitle>Zone 4–5 — HIIT</CardTitle>
        <Callout kind="danger">
          Zone 4/5 = cannot speak. HR ~{Math.round(max * 0.73)}–{Math.round(max * 0.85)} BPM. Improves VO2 max, cardiac output.
        </Callout>
        <ul className="space-y-1.5 text-[12px] text-[var(--color-text-2)]">
          <li>Tuesday: 6 rounds × 60s jump rope / stair sprints, 60s rest.</li>
          <li>Saturday: 5 rounds stair sprints — 2 min hard, 1 min rest. Peak intensity.</li>
        </ul>
      </Card>
      <Card>
        <CardTitle>Heart Rate Zones ({age}yo, Max ~{max})</CardTitle>
        <div className="grid grid-cols-5 gap-1.5">
          {HR_ZONES.map((z) => (
            <div
              key={z.z}
              className="rounded-md border px-1 py-2 text-center"
              style={{ background: `${z.color}18`, borderColor: `${z.color}4d` }}
            >
              <div className="font-[var(--font-mono)] text-[11px] font-extrabold" style={{ color: z.color }}>{z.z}</div>
              <div className="mt-1 font-[var(--font-mono)] text-[10px]" style={{ color: z.color }}>{z.calc(max)}</div>
              <div className="mt-0.5 text-[8px] text-[var(--color-text-3)]">{z.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function LawsView() {
  return (
    <Card accent="var(--color-accent)">
      <CardTitle>⚔️ The 12 Laws of God Mode</CardTitle>
      <div className="space-y-2.5">
        {LAWS.map((l) => (
          <div key={l.n} className="flex gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-dim)] font-[var(--font-mono)] text-[10px] font-bold text-[var(--color-accent)]">
              {l.n}
            </span>
            <span className="text-[12.5px] leading-relaxed text-[var(--color-text-2)]">{l.text}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
