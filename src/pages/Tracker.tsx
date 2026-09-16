import { useState, type ChangeEvent } from 'react'
import { motion } from 'motion/react'
import { GlassCard, SectionTitle, Segmented, Callout, TextField, TextAreaField, SelectField, Button } from '../components/ui'
import { CountUp } from '../components/CountUp'
import { PlusIcon, XIcon, MoonIcon, TargetIcon, DownloadIcon, TrashIcon, CheckIcon } from '../components/icons'
import { useStore } from '../store/StoreContext'
import { haptic } from '../lib/haptics'
import { HABITS } from '../data/plan'
import type { SessionEntry } from '../store/appState'

type Top = 'session' | 'history' | 'sleep' | 'habits' | 'data'

const DAY_OPTIONS = [
  'MON — Pull Day A', 'TUE — Push Day A', 'WED — Leg Day (Heavy)', 'THU — Pull Day B',
  'FRI — Push Day B', 'SAT — HS Mastery + Park Legs', 'SUN — Recovery', 'Skill Practice Only',
]

export default function Tracker() {
  const [top, setTop] = useState<Top>('session')
  return (
    <div className="px-4 pb-4">
      <Segmented
        value={top}
        onChange={setTop}
        options={[
          { value: 'session', label: 'Log' },
          { value: 'history', label: 'History' },
          { value: 'sleep', label: 'Sleep' },
          { value: 'habits', label: 'Habits' },
          { value: 'data', label: 'Data' },
        ]}
      />
      {top === 'session' && <LogSession />}
      {top === 'history' && <History />}
      {top === 'sleep' && <Sleep />}
      {top === 'habits' && <Habits />}
      {top === 'data' && <DataPanel />}
    </div>
  )
}

function LogSession() {
  const { setState } = useStore()
  const [day, setDay] = useState(DAY_OPTIONS[0])
  const [hs, setHs] = useState('')
  const [pu, setPu] = useState('')
  const [mu, setMu] = useState('')
  const [cv, setCv] = useState('')
  const [c2b, setC2b] = useState('')
  const [scap, setScap] = useState('')
  const [notes, setNotes] = useState('')
  const [exercises, setExercises] = useState<{ name: string; sets: string }[]>([])

  const addExRow = () => setExercises((e) => [...e, { name: '', sets: '' }])
  const updateEx = (i: number, field: 'name' | 'sets', v: string) =>
    setExercises((e) => e.map((row, idx) => (idx === i ? { ...row, [field]: v } : row)))
  const removeEx = (i: number) => setExercises((e) => e.filter((_, idx) => idx !== i))

  const save = () => {
    const num = (s: string) => (s ? parseInt(s, 10) : 0)
    setState((s) => {
      const session: SessionEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        dayType: day,
        exercises: [...exercises, notes ? { name: 'Notes', sets: notes } : null].filter(Boolean) as SessionEntry['exercises'],
      }
      const aura = { ...s.aura }
      if (hs) aura.hsRaw = Math.max(aura.hsRaw, num(hs))
      if (pu) aura.puRaw = Math.max(aura.puRaw, num(pu))
      if (mu) aura.muRaw = Math.max(aura.muRaw, num(mu))
      if (cv) aura.cvRaw = Math.max(aura.cvRaw, num(cv))
      if (c2b) aura.c2bRaw = Math.max(aura.c2bRaw, num(c2b))
      if (scap) aura.scapRaw = Math.max(aura.scapRaw, num(scap))
      return { ...s, sessions: [session, ...s.sessions], aura }
    })
    setHs(''); setPu(''); setMu(''); setCv(''); setC2b(''); setScap(''); setNotes(''); setExercises([])
  }

  return (
    <GlassCard glow="var(--color-accent)">
      <SectionTitle>Log Workout Session</SectionTitle>
      <div className="mb-4">
        <SelectField label="Session" value={day} onChange={setDay} options={DAY_OPTIONS} />
      </div>

      <div className="mb-2 font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--color-text-3)]">
        Skills this session → auto-updates Aura
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2.5">
        <TextField type="number" label="HS Hold (sec)" value={hs} onChange={(e) => setHs(e.target.value)} />
        <TextField type="number" label="Pull-ups (reps)" value={pu} onChange={(e) => setPu(e.target.value)} />
        <TextField type="number" label="Dips (reps)" value={mu} onChange={(e) => setMu(e.target.value)} />
        <TextField type="number" label="Stair sets done" value={cv} onChange={(e) => setCv(e.target.value)} />
        <TextField type="number" label="C2B Pull-ups (reps)" value={c2b} onChange={(e) => setC2b(e.target.value)} />
        <TextField type="number" label="Scapular Pull-ups (reps)" value={scap} onChange={(e) => setScap(e.target.value)} />
      </div>

      <div className="mb-2 font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--color-text-3)]">
        Exercise Log
      </div>
      {exercises.map((ex, i) => (
        <div key={i} className="mb-2 flex gap-1.5">
          <input
            value={ex.name}
            onChange={(e) => updateEx(i, 'name', e.target.value)}
            placeholder="Exercise"
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-[11.5px] outline-none focus:border-[var(--color-accent)]"
          />
          <input
            value={ex.sets}
            onChange={(e) => updateEx(i, 'sets', e.target.value)}
            placeholder="4x8 @ 60kg"
            className="w-28 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-[11.5px] outline-none focus:border-[var(--color-accent)]"
          />
          <button onClick={() => removeEx(i)} className="grid shrink-0 place-items-center rounded-lg border border-white/10 px-2 text-[var(--color-text-3)] transition-colors hover:bg-white/5">
            <XIcon width={13} height={13} />
          </button>
        </div>
      ))}
      <div className="mb-4">
        <Button variant="ghost" full onClick={addExRow}>
          <PlusIcon width={13} height={13} /> Add Exercise
        </Button>
      </div>

      <div className="mb-4">
        <TextAreaField
          label="Session Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did it feel? PRs? Issues?"
          className="min-h-[64px]"
        />
      </div>
      <Button full onClick={save}>Save Session + Sync Aura</Button>
    </GlassCard>
  )
}

function History() {
  const { state, setState } = useStore()
  const del = (id: string) => setState((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) }))
  return (
    <GlassCard>
      <SectionTitle trailing={<span className="font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">{state.sessions.length} total</span>}>
        Sessions
      </SectionTitle>
      {state.sessions.length === 0 && (
        <div className="py-8 text-center text-[12.5px] text-[var(--color-text-3)]">No sessions logged yet.</div>
      )}
      {state.sessions.map((s, i) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="border-b border-white/[0.06] py-3.5 last:border-none"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-bold">{s.dayType}</span>
            <div className="flex items-center gap-2">
              <span className="font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">
                {new Date(s.date).toLocaleDateString()}
              </span>
              <button onClick={() => del(s.id)} className="text-[var(--color-text-3)] transition-colors hover:text-[var(--color-accent)]">
                <XIcon width={13} height={13} />
              </button>
            </div>
          </div>
          {s.exercises.map((ex, ei) => (
            <div key={ei} className="mt-1.5 flex justify-between text-[11.5px] text-[var(--color-text-2)]">
              <span>{ex.name}</span>
              <span className="font-[var(--font-mono)] text-[var(--color-text-3)]">{ex.sets}</span>
            </div>
          ))}
        </motion.div>
      ))}
    </GlassCard>
  )
}

function Sleep() {
  const { state, setState } = useStore()
  const [hrs, setHrs] = useState('')
  const [qual, setQual] = useState('')
  const last7 = state.sleep.slice(-7)
  const avg = last7.length ? Number((last7.reduce((a, b) => a + b.hours, 0) / last7.length).toFixed(1)) : 0
  const lastNight = state.sleep.at(-1)?.hours ?? 0

  const log = () => {
    const h = parseFloat(hrs)
    if (Number.isNaN(h)) return
    setState((s) => ({ ...s, sleep: [...s.sleep, { date: new Date().toISOString(), hours: h }] }))
    setHrs(''); setQual('')
  }

  return (
    <GlassCard glow="var(--color-purple)">
      <SectionTitle icon={<MoonIcon width={14} height={14} />} color="var(--color-purple)">Sleep Log</SectionTitle>
      <div className="mb-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-white/[0.03] p-3 text-center">
          <div className="font-[var(--font-mono)] text-xl font-extrabold"><CountUp value={avg} decimals={1} /></div>
          <div className="mt-0.5 text-[9px] uppercase tracking-wide text-[var(--color-text-3)]">7-day avg</div>
        </div>
        <div className="rounded-xl bg-white/[0.03] p-3 text-center">
          <div className="font-[var(--font-mono)] text-xl font-extrabold"><CountUp value={lastNight} decimals={1} /></div>
          <div className="mt-0.5 text-[9px] uppercase tracking-wide text-[var(--color-text-3)]">last night</div>
        </div>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2.5">
        <TextField type="number" label="Hours slept" value={hrs} onChange={(e) => setHrs(e.target.value)} />
        <TextField type="number" label="Quality (1-5)" value={qual} onChange={(e) => setQual(e.target.value)} />
      </div>
      <Button full onClick={log}>Log Sleep</Button>
    </GlassCard>
  )
}

function Habits() {
  const { state, setState } = useStore()
  const toggle = (key: string) => {
    haptic()
    setState((s) => ({ ...s, habits: { ...s.habits, [key]: !s.habits[key] } }))
  }
  return (
    <GlassCard glow="var(--color-green)">
      <SectionTitle icon={<TargetIcon width={14} height={14} />} color="var(--color-green)">Daily Habits</SectionTitle>
      <Callout kind="tip">Non-negotiables beyond training. Tap to mark done for today.</Callout>
      {HABITS.map((h) => {
        const done = !!state.habits[h.key]
        return (
          <button
            key={h.key}
            onClick={() => toggle(h.key)}
            className="flex w-full items-center gap-3 border-b border-white/[0.06] py-3 text-left last:border-none"
          >
            <span className="text-lg">{h.icon}</span>
            <span className="flex-1">
              <div className={`text-[13px] font-semibold ${done ? 'text-[var(--color-text-3)] line-through' : ''}`}>{h.name}</div>
              <div className="text-[10.5px] text-[var(--color-text-3)]">{h.sub}</div>
            </span>
            <motion.span
              animate={{ scale: done ? [1, 1.15, 1] : 1 }}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px]"
              style={{ borderColor: done ? 'var(--color-green)' : 'var(--color-border-2)', background: done ? 'var(--color-green)' : 'transparent' }}
            >
              {done && <CheckIcon width={13} height={13} strokeWidth={3} style={{ color: '#04150c' }} />}
            </motion.span>
          </button>
        )
      })}
    </GlassCard>
  )
}

function DataPanel() {
  const { state, setState } = useStore()

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `godmode-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        setState((s) => ({ ...s, ...parsed }))
      } catch {
        // ignore malformed file
      }
    }
    reader.readAsText(file)
  }

  const clearAll = () => {
    if (!confirm('This permanently deletes ALL logged data. Continue?')) return
    setState((s) => ({ ...s, water: 0, steps: 0, checklist: {}, sessions: [], weights: [], sleep: [], macros: { p: 0, c: 0, f: 0, k: 0 }, streakDays: [], habits: {} }))
  }

  return (
    <div className="space-y-3">
      <GlassCard glow="var(--color-blue)">
        <SectionTitle icon={<DownloadIcon width={14} height={14} />} color="var(--color-blue)">Data Backup</SectionTitle>
        <Callout kind="tip">
          Your sessions, weights, streaks, sleep, and food logs sync to your account when signed in, and are always cached locally. Export regularly for a portable copy.
        </Callout>
        <div className="mb-2.5">
          <Button variant="secondary" full color="var(--color-blue)" onClick={exportData}>
            <DownloadIcon width={14} height={14} /> Export Backup JSON
          </Button>
        </div>
        <input type="file" accept=".json" onChange={importData} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-[var(--color-text-2)] file:mr-2 file:rounded-md file:border-none file:bg-white/10 file:px-2 file:py-1 file:text-[10px] file:text-[var(--color-text)]" />
        <div className="mt-2 text-[10.5px] leading-relaxed text-[var(--color-text-3)]">
          Import merges into current data. Export first if unsure.
        </div>
      </GlassCard>
      <GlassCard glow="var(--color-accent)">
        <SectionTitle icon={<TrashIcon width={14} height={14} />} color="var(--color-accent)">Danger Zone</SectionTitle>
        <Callout kind="danger">This permanently deletes today's logged data. Export a backup first.</Callout>
        <Button full onClick={clearAll}>Clear Logged Data</Button>
      </GlassCard>
    </div>
  )
}
