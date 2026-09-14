import { useState } from 'react'
import { Card, CardTitle, Segmented, Callout } from '../components/ui'
import { PlusIcon } from '../components/icons'
import { useStore } from '../store/StoreContext'
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
    <div className="px-3 pb-4 pt-3">
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

function NumInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold text-[var(--color-text-3)]">{label}</div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-[var(--color-border-2)] bg-[var(--color-bg-3)] px-2.5 py-2 font-[var(--font-mono)] text-sm outline-none focus:border-[var(--color-accent)]"
      />
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
    <Card>
      <CardTitle>Log Workout Session</CardTitle>
      <select
        value={day}
        onChange={(e) => setDay(e.target.value)}
        className="mb-3 w-full rounded-md border border-[var(--color-border-2)] bg-[var(--color-bg-3)] px-2.5 py-2 text-[12px] outline-none focus:border-[var(--color-accent)]"
      >
        {DAY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
      </select>

      <div className="mb-1.5 mt-3 font-[var(--font-mono)] text-[9px] font-bold uppercase tracking-[1.2px] text-[var(--color-text-3)]">
        Skills this session → auto-updates Aura
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2.5">
        <NumInput label="HS Hold (sec)" value={hs} onChange={setHs} />
        <NumInput label="Pull-ups (reps)" value={pu} onChange={setPu} />
        <NumInput label="Dips (reps)" value={mu} onChange={setMu} />
        <NumInput label="Stair sets done" value={cv} onChange={setCv} />
        <NumInput label="C2B Pull-ups (reps)" value={c2b} onChange={setC2b} />
        <NumInput label="Scapular Pull-ups (reps)" value={scap} onChange={setScap} />
      </div>

      <div className="mb-1.5 font-[var(--font-mono)] text-[9px] font-bold uppercase tracking-[1.2px] text-[var(--color-text-3)]">
        Exercise Log
      </div>
      {exercises.map((ex, i) => (
        <div key={i} className="mb-1.5 flex gap-1.5">
          <input
            value={ex.name}
            onChange={(e) => updateEx(i, 'name', e.target.value)}
            placeholder="Exercise"
            className="flex-1 rounded-md border border-[var(--color-border-2)] bg-[var(--color-bg-3)] px-2 py-1.5 text-[11px] outline-none focus:border-[var(--color-accent)]"
          />
          <input
            value={ex.sets}
            onChange={(e) => updateEx(i, 'sets', e.target.value)}
            placeholder="4x8 @ 60kg"
            className="w-28 rounded-md border border-[var(--color-border-2)] bg-[var(--color-bg-3)] px-2 py-1.5 text-[11px] outline-none focus:border-[var(--color-accent)]"
          />
          <button onClick={() => removeEx(i)} className="rounded-md border border-[var(--color-border-2)] px-2 text-[var(--color-text-3)]">×</button>
        </div>
      ))}
      <button
        onClick={addExRow}
        className="mb-2.5 flex w-full items-center justify-center gap-1.5 rounded-md border border-[var(--color-border-2)] py-2 text-[11px] font-semibold text-[var(--color-text-2)] active:scale-95 transition-transform"
      >
        <PlusIcon width={13} height={13} /> Add Exercise
      </button>

      <div className="mb-1 text-[10px] font-semibold text-[var(--color-text-3)]">Session Notes</div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="How did it feel? PRs? Issues?"
        className="mb-3 min-h-[60px] w-full resize-y rounded-md border border-[var(--color-border-2)] bg-[var(--color-bg-3)] px-2.5 py-2 text-[12px] outline-none focus:border-[var(--color-accent)]"
      />
      <button
        onClick={save}
        className="w-full rounded-md bg-[var(--color-accent)] py-3 text-[13px] font-extrabold tracking-wide text-white active:opacity-80 transition-opacity"
      >
        SAVE SESSION + SYNC AURA
      </button>
    </Card>
  )
}

function History() {
  const { state, setState } = useStore()
  const del = (id: string) => setState((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) }))
  return (
    <Card>
      <CardTitle>
        Sessions <span className="font-[var(--font-mono)] text-[var(--color-text-3)]">· {state.sessions.length} total</span>
      </CardTitle>
      {state.sessions.length === 0 && (
        <div className="py-6 text-center text-[12px] text-[var(--color-text-3)]">No sessions logged yet.</div>
      )}
      {state.sessions.map((s) => (
        <div key={s.id} className="border-b border-[var(--color-border)] py-3 last:border-none">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold">{s.dayType}</span>
            <div className="flex items-center gap-2">
              <span className="font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">
                {new Date(s.date).toLocaleDateString()}
              </span>
              <button onClick={() => del(s.id)} className="text-[var(--color-text-3)]">×</button>
            </div>
          </div>
          {s.exercises.map((ex, i) => (
            <div key={i} className="mt-1 flex justify-between text-[11px] text-[var(--color-text-2)]">
              <span>{ex.name}</span>
              <span className="font-[var(--font-mono)] text-[var(--color-text-3)]">{ex.sets}</span>
            </div>
          ))}
        </div>
      ))}
    </Card>
  )
}

function Sleep() {
  const { state, setState } = useStore()
  const [hrs, setHrs] = useState('')
  const [qual, setQual] = useState('')
  const last7 = state.sleep.slice(-7)
  const avg = last7.length ? (last7.reduce((a, b) => a + b.hours, 0) / last7.length).toFixed(1) : '—'
  const lastNight = state.sleep.at(-1)?.hours ?? '—'

  const log = () => {
    const h = parseFloat(hrs)
    if (Number.isNaN(h)) return
    setState((s) => ({ ...s, sleep: [...s.sleep, { date: new Date().toISOString(), hours: h }] }))
    setHrs(''); setQual('')
  }

  return (
    <Card>
      <CardTitle>😴 Sleep Log</CardTitle>
      <div className="mb-3 grid grid-cols-2 gap-2.5">
        <div className="rounded-md bg-[var(--color-bg-3)] p-2.5 text-center">
          <div className="font-[var(--font-mono)] text-xl font-extrabold">{avg}</div>
          <div className="text-[9px] text-[var(--color-text-3)]">7-DAY AVG</div>
        </div>
        <div className="rounded-md bg-[var(--color-bg-3)] p-2.5 text-center">
          <div className="font-[var(--font-mono)] text-xl font-extrabold">{lastNight}</div>
          <div className="text-[9px] text-[var(--color-text-3)]">LAST NIGHT</div>
        </div>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2.5">
        <NumInput label="Hours slept" value={hrs} onChange={setHrs} />
        <NumInput label="Quality (1-5)" value={qual} onChange={setQual} />
      </div>
      <button onClick={log} className="w-full rounded-md bg-[var(--color-accent)] py-3 text-[13px] font-extrabold tracking-wide text-white active:opacity-80 transition-opacity">
        LOG SLEEP
      </button>
    </Card>
  )
}

function Habits() {
  const { state, setState } = useStore()
  const toggle = (key: string) => setState((s) => ({ ...s, habits: { ...s.habits, [key]: !s.habits[key] } }))
  return (
    <Card>
      <CardTitle>🎯 Daily Habits</CardTitle>
      <Callout kind="tip">Non-negotiables beyond training. Tap to mark done for today.</Callout>
      {HABITS.map((h) => {
        const done = !!state.habits[h.key]
        return (
          <button
            key={h.key}
            onClick={() => toggle(h.key)}
            className="flex w-full items-center gap-2.5 border-b border-[var(--color-border)] py-2.5 text-left last:border-none"
          >
            <span className="text-lg">{h.icon}</span>
            <span className="flex-1">
              <div className={`text-[13px] font-semibold ${done ? 'text-[var(--color-text-3)] line-through' : ''}`}>{h.name}</div>
              <div className="text-[10px] text-[var(--color-text-3)]">{h.sub}</div>
            </span>
            <span
              className="h-5 w-5 shrink-0 rounded-full border-[1.5px]"
              style={{ borderColor: done ? 'var(--color-green)' : 'var(--color-border-2)', background: done ? 'var(--color-green)' : 'transparent' }}
            />
          </button>
        )
      })}
    </Card>
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

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="space-y-2.5">
      <Card>
        <CardTitle>💾 Data Backup</CardTitle>
        <Callout kind="tip">
          Your sessions, weights, streaks, sleep, and food logs sync to your account when signed in, and are always cached locally. Export regularly for a portable copy.
        </Callout>
        <button onClick={exportData} className="mb-2 w-full rounded-md bg-[var(--color-blue)] py-2.5 text-[12px] font-bold text-white active:opacity-80 transition-opacity">
          ⬇ Export — Download Backup JSON
        </button>
        <input type="file" accept=".json" onChange={importData} className="w-full rounded-md border border-[var(--color-border-2)] bg-[var(--color-bg-3)] px-2 py-1.5 text-[11px]" />
        <div className="mt-2 font-[var(--font-mono)] text-[10px] leading-relaxed text-[var(--color-text-3)]">
          Import merges into current data. Export first if unsure.
        </div>
      </Card>
      <Card>
        <CardTitle>🗑 Danger Zone</CardTitle>
        <Callout kind="danger">This permanently deletes today's logged data. Export a backup first.</Callout>
        <button onClick={clearAll} className="w-full rounded-md bg-[var(--color-accent)] py-2.5 text-[12px] font-bold text-white active:opacity-80 transition-opacity">
          Clear Logged Data
        </button>
      </Card>
    </div>
  )
}
