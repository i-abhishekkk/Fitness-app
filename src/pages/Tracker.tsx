import { useState, type ChangeEvent } from 'react'
import type * as XLSXNS from 'xlsx'
import { motion } from 'motion/react'
import { GlassCard, SectionTitle, Segmented, Callout, TextField, TextAreaField, SelectField, Button, Toggle } from '../components/ui'
import { CountUp } from '../components/CountUp'
import { PlusIcon, XIcon, MoonIcon, TargetIcon, DownloadIcon, TrashIcon, CheckIcon, BellIcon, ChevronDownIcon } from '../components/icons'
import { useStore } from '../store/StoreContext'
import { enablePush, disablePush } from '../lib/firebase'
import { haptic } from '../lib/haptics'
import { HABITS, getTodayDow } from '../data/plan'
import { SPLIT } from '../data/workouts'
import { getCurrentMesoWeek } from '../data/periodization'
import type { SessionEntry, SessionExercise } from '../store/appState'

type Top = 'session' | 'history' | 'sleep' | 'habits' | 'data'

const DAY_OPTIONS = SPLIT.map((d) => `${d.dow} — ${d.title}`)
const EXTRA_OPTION = 'Skill Practice Only (not on the split)'

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
  const todayOption = (() => {
    const d = SPLIT.find((x) => x.dow === getTodayDow())
    return d ? `${d.dow} — ${d.title}` : EXTRA_OPTION
  })()
  const [day, setDay] = useState(todayOption)
  const [hs, setHs] = useState('')
  const [pu, setPu] = useState('')
  const [mu, setMu] = useState('')
  const [cv, setCv] = useState('')
  const [c2b, setC2b] = useState('')
  const [scap, setScap] = useState('')
  const [notes, setNotes] = useState('')
  const [logged, setLogged] = useState<Record<string, { sets: string; reps: string; weight: string; rpe: string }>>({})
  const [extra, setExtra] = useState<{ name: string; sets: string }[]>([])

  const splitDay = SPLIT.find((d) => `${d.dow} — ${d.title}` === day)
  const listedExercises = splitDay ? splitDay.blocks.flatMap((b) => b.exercises.map((e) => e.name)) : []
  const meso = getCurrentMesoWeek()
  const targetRpeMatch = meso.rpeTarget.match(/RPE\s*(\d+)/)
  const targetRpe = targetRpeMatch ? Number(targetRpeMatch[1]) : null

  const setField = (name: string, field: 'sets' | 'reps' | 'weight' | 'rpe', v: string) =>
    setLogged((l) => ({ ...l, [name]: { ...(l[name] ?? { sets: '', reps: '', weight: '', rpe: '' }), [field]: v } }))

  const addExtraRow = () => setExtra((e) => [...e, { name: '', sets: '' }])
  const updateExtra = (i: number, field: 'name' | 'sets', v: string) =>
    setExtra((e) => e.map((row, idx) => (idx === i ? { ...row, [field]: v } : row)))
  const removeExtra = (i: number) => setExtra((e) => e.filter((_, idx) => idx !== i))

  const save = () => {
    const num = (s: string) => (s ? parseInt(s, 10) : 0)
    const fromSplit = listedExercises
      .map((name) => {
        const l = logged[name]
        if (!l || (!l.sets && !l.reps && !l.weight)) return null
        const parts = [l.sets && `${l.sets} sets`, l.reps && `${l.reps} reps`, l.weight && `${l.weight}kg`, l.rpe && `RPE ${l.rpe}`].filter(Boolean).join(' × ')
        const entry: SessionExercise = { name, sets: parts || '—' }
        if (l.sets && l.reps && l.weight) {
          entry.raw = { sets: Number(l.sets), reps: Number(l.reps), weightKg: Number(l.weight), rpe: l.rpe ? Number(l.rpe) : undefined }
        }
        return entry
      })
      .filter(Boolean) as SessionEntry['exercises']

    setState((s) => {
      const session: SessionEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        dayType: day,
        exercises: [...fromSplit, ...extra, notes ? { name: 'Notes', sets: notes } : null].filter(Boolean) as SessionEntry['exercises'],
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
    setHs(''); setPu(''); setMu(''); setCv(''); setC2b(''); setScap(''); setNotes(''); setLogged({}); setExtra([])
  }

  return (
    <GlassCard glow="var(--color-accent)">
      <SectionTitle>Log Workout Session</SectionTitle>
      <div className="mb-4">
        <SelectField label="Session" value={day} onChange={setDay} options={[...DAY_OPTIONS, EXTRA_OPTION]} />
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

      {listedExercises.length > 0 && (
        <>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--color-text-3)]">
              {day.split(' — ')[1] ?? 'Today'}'s Exercises
            </div>
            {targetRpe && (
              <div className="font-[var(--font-mono)] text-[9.5px] font-bold" style={{ color: meso.color }}>
                Week {meso.week} target: RPE {targetRpe}
              </div>
            )}
          </div>
          <div className="mb-4 space-y-2.5">
            {listedExercises.map((name) => {
              const l = logged[name] ?? { sets: '', reps: '', weight: '', rpe: '' }
              const rpeNum = l.rpe ? Number(l.rpe) : null
              const rpeDelta = rpeNum && targetRpe ? rpeNum - targetRpe : null
              return (
                <div key={name} className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                  <div className="mb-2 text-[12px] font-semibold leading-snug">{name}</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    <input
                      value={l.sets}
                      onChange={(e) => setField(name, 'sets', e.target.value)}
                      type="number"
                      placeholder="Sets"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[11.5px] outline-none focus:border-[var(--color-accent)]"
                    />
                    <input
                      value={l.reps}
                      onChange={(e) => setField(name, 'reps', e.target.value)}
                      type="number"
                      placeholder="Reps"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[11.5px] outline-none focus:border-[var(--color-accent)]"
                    />
                    <input
                      value={l.weight}
                      onChange={(e) => setField(name, 'weight', e.target.value)}
                      type="number"
                      placeholder="kg"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[11.5px] outline-none focus:border-[var(--color-accent)]"
                    />
                    <input
                      value={l.rpe}
                      onChange={(e) => setField(name, 'rpe', e.target.value)}
                      type="number"
                      min={1}
                      max={10}
                      placeholder="RPE"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[11.5px] outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>
                  {rpeDelta !== null && (
                    <div className="mt-1.5 text-[10px]" style={{ color: rpeDelta === 0 ? 'var(--color-green)' : rpeDelta > 0 ? 'var(--color-accent)' : 'var(--color-text-3)' }}>
                      {rpeDelta === 0 ? 'On target for this week' : rpeDelta > 0 ? `${rpeDelta} harder than this week's target` : `${Math.abs(rpeDelta)} easier than this week's target`}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      <div className="mb-2 font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--color-text-3)]">
        Extra Exercises (not on the split)
      </div>
      {extra.map((ex, i) => (
        <div key={i} className="mb-2 flex gap-1.5">
          <input
            value={ex.name}
            onChange={(e) => updateExtra(i, 'name', e.target.value)}
            placeholder="Exercise"
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-[11.5px] outline-none focus:border-[var(--color-accent)]"
          />
          <input
            value={ex.sets}
            onChange={(e) => updateExtra(i, 'sets', e.target.value)}
            placeholder="4x8 @ 60kg"
            className="w-28 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-[11.5px] outline-none focus:border-[var(--color-accent)]"
          />
          <button onClick={() => removeExtra(i)} className="grid shrink-0 place-items-center rounded-lg border border-white/10 px-2 text-[var(--color-text-3)] transition-colors hover:bg-white/5">
            <XIcon width={13} height={13} />
          </button>
        </div>
      ))}
      <div className="mb-4">
        <Button variant="ghost" full onClick={addExtraRow}>
          <PlusIcon width={13} height={13} /> Add Extra Exercise
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

function NotificationsCard() {
  const { state, setState } = useStore()
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const on = state.push.enabled

  const toggle = async () => {
    setBusy(true)
    setStatus(null)
    if (on) {
      await disablePush()
      setState((s) => ({ ...s, push: { enabled: false, token: null } }))
    } else {
      const result = await enablePush()
      if ('token' in result) {
        setState((s) => ({ ...s, push: { enabled: true, token: result.token } }))
      } else if (result.error === 'denied') {
        setStatus('Blocked — allow notifications for this site in your browser settings, then try again.')
      } else if (result.error === 'unsupported') {
        setStatus('Not supported here yet — on iPhone, install the app to your home screen first (Share → Add to Home Screen), then enable from inside the installed app.')
      } else {
        setStatus('Not configured yet.')
      }
    }
    setBusy(false)
  }

  return (
    <GlassCard glow="var(--color-purple)">
      <SectionTitle icon={<BellIcon width={14} height={14} />} color="var(--color-purple)">Reminders</SectionTitle>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12.5px] font-semibold">Push notifications</div>
          <div className="mt-0.5 text-[10.5px] leading-relaxed text-[var(--color-text-3)]">
            {on ? 'Enabled on this device.' : 'Get reminded to log water, steps, and missions.'}
          </div>
        </div>
        <Toggle on={on} onToggle={toggle} color="var(--color-purple)" />
      </div>
      {busy && <div className="mt-2 text-[10.5px] text-[var(--color-text-3)]">Working…</div>}
      {status && (
        <div className="mt-2.5 rounded-lg bg-white/[0.03] px-2.5 py-2 text-[10.5px] leading-relaxed text-[var(--color-text-2)]">
          {status}
        </div>
      )}
    </GlassCard>
  )
}

type Range = '7' | '30' | '90' | 'all'
const RANGE_LABELS: Record<Range, string> = { '7': '7 Days', '30': '30 Days', '90': '90 Days', all: 'All Time' }

function appendSheet(XLSX: typeof XLSXNS, wb: XLSXNS.WorkBook, rows: Record<string, unknown>[], name: string) {
  const ws = rows.length ? XLSX.utils.json_to_sheet(rows) : XLSX.utils.aoa_to_sheet([[`No ${name.toLowerCase()} logged in this range`]])
  XLSX.utils.book_append_sheet(wb, ws, name)
}

function DataPanel() {
  const { state, setState } = useStore()
  const [range, setRange] = useState<Range>('all')
  const [exporting, setExporting] = useState(false)

  // Full, unfiltered JSON snapshot — this is the restore format (imported back via the file
  // picker below), so it deliberately ignores the date-range selector. That selector only
  // applies to the human-readable Excel export beneath it.
  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `godmode-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportExcel = async () => {
    setExporting(true)
    try {
      const XLSX = await import('xlsx')
      const cutoff = range === 'all' ? 0 : Date.now() - Number(range) * 86_400_000
      const inRange = (d: string) => new Date(d).getTime() >= cutoff

      const wb = XLSX.utils.book_new()

      const sessionRows = state.sessions
        .filter((s) => inRange(s.date))
        .flatMap((s) =>
          s.exercises.map((e) => ({
            Date: new Date(s.date).toLocaleDateString(),
            'Day Type': s.dayType,
            Exercise: e.name,
            Sets: e.raw?.sets ?? '',
            Reps: e.raw?.reps ?? '',
            'Weight (kg)': e.raw?.weightKg ?? '',
            RPE: e.raw?.rpe ?? '',
            Detail: e.sets,
          })),
        )
      appendSheet(XLSX, wb, sessionRows, 'Sessions')

      const weightRows = state.weights.filter((w) => inRange(w.date)).map((w) => ({ Date: new Date(w.date).toLocaleDateString(), 'Weight (kg)': w.kg }))
      appendSheet(XLSX, wb, weightRows, 'Weights')

      const sleepRows = state.sleep.filter((s) => inRange(s.date)).map((s) => ({ Date: new Date(s.date).toLocaleDateString(), 'Hours Slept': s.hours }))
      appendSheet(XLSX, wb, sleepRows, 'Sleep')

      const foodRows = state.food.filter((f) => inRange(f.date)).map((f) => ({
        Date: new Date(f.date).toLocaleDateString(), Meal: f.name, 'Protein (g)': f.p, 'Carbs (g)': f.c, 'Fat (g)': f.f, Kcal: f.k,
      }))
      appendSheet(XLSX, wb, foodRows, 'Food Log')

      const measurementRows = state.measurements.filter((m) => inRange(m.date)).map((m) => ({
        Date: new Date(m.date).toLocaleDateString(),
        'Chest (cm)': m.chest ?? '', 'Waist (cm)': m.waist ?? '', 'Hips (cm)': m.hips ?? '', 'Arms (cm)': m.arms ?? '', 'Thighs (cm)': m.thighs ?? '', 'Neck (cm)': m.neck ?? '',
      }))
      appendSheet(XLSX, wb, measurementRows, 'Measurements')

      const currentWeight = state.weights.at(-1)?.kg ?? null
      const bmi = state.heightCm && currentWeight ? currentWeight / (state.heightCm / 100) ** 2 : null
      appendSheet(
        XLSX,
        wb,
        [
          { Field: 'Export range', Value: RANGE_LABELS[range] },
          { Field: 'Exported on', Value: new Date().toLocaleString() },
          { Field: 'Current weight (kg)', Value: currentWeight ?? '' },
          { Field: 'Height (cm)', Value: state.heightCm ?? '' },
          { Field: 'BMI', Value: bmi ? bmi.toFixed(1) : '' },
          { Field: 'Streak (total days logged, all-time)', Value: state.streakDays.length },
          { Field: 'Handstand hold best (s)', Value: state.aura.hsRaw },
          { Field: 'Pull-ups best (reps)', Value: state.aura.puRaw },
          { Field: 'Dips best (reps)', Value: state.aura.muRaw },
          { Field: 'Stair sets best', Value: state.aura.cvRaw },
          { Field: 'C2B pull-ups best (reps)', Value: state.aura.c2bRaw },
          { Field: 'Scapular pull-ups best (reps)', Value: state.aura.scapRaw },
        ],
        'Summary',
      )

      XLSX.writeFile(wb, `godmode-export-${range}-${new Date().toISOString().slice(0, 10)}.xlsx`)
    } finally {
      setExporting(false)
    }
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

  return (
    <div className="space-y-3">
      <NotificationsCard />
      <GlassCard glow="var(--color-teal)">
        <SectionTitle icon={<DownloadIcon width={14} height={14} />} color="var(--color-teal)">Export to Excel</SectionTitle>
        <Callout kind="tip">
          A readable spreadsheet — separate Sessions, Weights, Sleep, Food, Measurements, and Summary sheets. For opening in Excel/Sheets, not for restoring into the app.
        </Callout>
        <div className="mb-3">
          <Segmented value={range} onChange={setRange} options={(Object.keys(RANGE_LABELS) as Range[]).map((r) => ({ value: r, label: RANGE_LABELS[r] }))} />
        </div>
        <Button full color="var(--color-teal)" onClick={exportExcel} disabled={exporting}>
          <DownloadIcon width={14} height={14} /> {exporting ? 'Building…' : `Export .xlsx (${RANGE_LABELS[range]})`}
        </Button>
      </GlassCard>
      <GlassCard glow="var(--color-blue)">
        <SectionTitle icon={<DownloadIcon width={14} height={14} />} color="var(--color-blue)">Backup &amp; Restore</SectionTitle>
        <Callout kind="tip">
          A full JSON snapshot of everything (always the complete history, not just the range above) — this is what re-loads back into the app below, so it's the one to keep for disaster recovery, not for reading.
        </Callout>
        <div className="mb-2.5">
          <Button variant="secondary" full color="var(--color-blue)" onClick={exportData}>
            <DownloadIcon width={14} height={14} /> Export Backup JSON
          </Button>
        </div>
        <div className="mb-1.5 text-[11px] font-semibold text-[var(--color-text-3)]">Restore from a backup file</div>
        <input type="file" accept=".json" onChange={importData} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-[var(--color-text-2)] file:mr-2 file:rounded-md file:border-none file:bg-white/10 file:px-2 file:py-1 file:text-[10px] file:text-[var(--color-text)]" />
        <div className="mt-2 text-[10.5px] leading-relaxed text-[var(--color-text-3)]">
          Only accepts a JSON file exported from here (not the Excel file above). Useful after clearing data, on a new device, or if cloud sync ever fails. Import merges into current data — export first if unsure.
        </div>
      </GlassCard>
      <DangerZone />
    </div>
  )
}

const CLEARED_FIELDS = 'water, steps, today\'s checklist, workout sessions, weight log, sleep log, macros, streak history, and habit toggles'

function DangerZone() {
  const { setState } = useStore()
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const clearAll = () => {
    setState((s) => ({ ...s, water: 0, steps: 0, checklist: {}, sessions: [], weights: [], sleep: [], macros: { p: 0, c: 0, f: 0, k: 0 }, streakDays: [], habits: {} }))
    setConfirming(false)
    setOpen(false)
  }

  return (
    <GlassCard glow="var(--color-accent)">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <SectionTitle icon={<TrashIcon width={14} height={14} />} color="var(--color-accent)">Danger Zone</SectionTitle>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-[var(--color-text-3)]">
          <ChevronDownIcon width={16} height={16} />
        </motion.span>
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
          <div className="pt-1">
            <Callout kind="danger">
              Clears {CLEARED_FIELDS} — on this device AND in your synced cloud copy. Body measurements, food log, height, and skill numbers are not touched. There's no undo — export a backup first if unsure.
            </Callout>
            {!confirming ? (
              <Button full onClick={() => setConfirming(true)}>Clear Logged Data</Button>
            ) : (
              <div className="space-y-2">
                <div className="text-center text-[11.5px] font-bold text-[var(--color-accent)]">Are you sure? This can't be undone.</div>
                <div className="flex gap-2">
                  <Button variant="secondary" full onClick={() => setConfirming(false)}>Cancel</Button>
                  <Button full onClick={clearAll}>Yes, Delete</Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </GlassCard>
  )
}
