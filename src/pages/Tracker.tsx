import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
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
import { pushActivity, type SessionEntry, type SessionExercise, type SetLog } from '../store/appState'

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

interface DraftSet {
  reps: string
  weight: string
  rpe: string
}
interface LogDraft {
  day: string
  hs: string
  pu: string
  mu: string
  cv: string
  c2b: string
  scap: string
  notes: string
  logged: Record<string, DraftSet[]>
  extra: { name: string; sets: string }[]
}

const DRAFT_KEY = 'gm5-log-draft'
const emptyDraft = (day: string): LogDraft => ({ day, hs: '', pu: '', mu: '', cv: '', c2b: '', scap: '', notes: '', logged: {}, extra: [] })
function loadDraft(fallbackDay: string): LogDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return emptyDraft(fallbackDay)
    return { ...emptyDraft(fallbackDay), ...JSON.parse(raw) }
  } catch {
    return emptyDraft(fallbackDay)
  }
}
function saveDraft(d: LogDraft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d))
  } catch {
    // storage full/unavailable — draft just won't survive a reload, not fatal
  }
}
function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // nothing to clean up if storage isn't available
  }
}

function LogSession() {
  const { setState } = useStore()
  const todayOption = (() => {
    const d = SPLIT.find((x) => x.dow === getTodayDow())
    return d ? `${d.dow} — ${d.title}` : EXTRA_OPTION
  })()
  // Persisted to localStorage on every change (below) so an in-progress log survives switching
  // tabs, backgrounding the app, or the browser discarding the page — previously this all lived
  // in plain component state and vanished the moment LogSession unmounted.
  const [draft, setDraft] = useState<LogDraft>(() => loadDraft(todayOption))
  useEffect(() => saveDraft(draft), [draft])

  const { day, hs, pu, mu, cv, c2b, scap, notes, logged, extra } = draft
  const setDay = (v: string) => setDraft((d) => ({ ...d, day: v }))
  const setHs = (v: string) => setDraft((d) => ({ ...d, hs: v }))
  const setPu = (v: string) => setDraft((d) => ({ ...d, pu: v }))
  const setMu = (v: string) => setDraft((d) => ({ ...d, mu: v }))
  const setCv = (v: string) => setDraft((d) => ({ ...d, cv: v }))
  const setC2b = (v: string) => setDraft((d) => ({ ...d, c2b: v }))
  const setScap = (v: string) => setDraft((d) => ({ ...d, scap: v }))
  const setNotes = (v: string) => setDraft((d) => ({ ...d, notes: v }))

  const splitDay = SPLIT.find((d) => `${d.dow} — ${d.title}` === day)
  const listedExercises = splitDay ? splitDay.blocks.flatMap((b) => b.exercises.map((e) => e.name)) : []
  const meso = getCurrentMesoWeek()
  const targetRpeMatch = meso.rpeTarget.match(/RPE\s*(\d+)/)
  const targetRpe = targetRpeMatch ? Number(targetRpeMatch[1]) : null

  const setsFor = (name: string) => logged[name] ?? []
  const addSet = (name: string) =>
    setDraft((d) => ({ ...d, logged: { ...d.logged, [name]: [...(d.logged[name] ?? []), { reps: '', weight: '', rpe: '' }] } }))
  const updateSet = (name: string, idx: number, field: keyof DraftSet, v: string) =>
    setDraft((d) => ({
      ...d,
      logged: { ...d.logged, [name]: (d.logged[name] ?? []).map((s, i) => (i === idx ? { ...s, [field]: v } : s)) },
    }))
  const removeSet = (name: string, idx: number) =>
    setDraft((d) => ({ ...d, logged: { ...d.logged, [name]: (d.logged[name] ?? []).filter((_, i) => i !== idx) } }))

  const addExtraRow = () => setDraft((d) => ({ ...d, extra: [...d.extra, { name: '', sets: '' }] }))
  const updateExtra = (i: number, field: 'name' | 'sets', v: string) =>
    setDraft((d) => ({ ...d, extra: d.extra.map((row, idx) => (idx === i ? { ...row, [field]: v } : row)) }))
  const removeExtra = (i: number) => setDraft((d) => ({ ...d, extra: d.extra.filter((_, idx) => idx !== i) }))

  const discardDraft = () => {
    clearDraft()
    setDraft(emptyDraft(todayOption))
  }

  const save = () => {
    const num = (s: string) => (s ? parseInt(s, 10) : 0)
    const fromSplit = listedExercises
      .map((name) => {
        const sets = (logged[name] ?? []).filter((s) => s.reps && s.weight)
        if (!sets.length) return null
        const raw: SetLog[] = sets.map((s) => ({ reps: Number(s.reps), weightKg: Number(s.weight), rpe: s.rpe ? Number(s.rpe) : undefined }))
        const detail = raw.map((s) => `${s.weightKg}kg×${s.reps}${s.rpe ? ` @RPE${s.rpe}` : ''}`).join(', ')
        const entry: SessionExercise = { name, sets: `${raw.length} set${raw.length > 1 ? 's' : ''}: ${detail}`, raw }
        return entry
      })
      .filter(Boolean) as SessionEntry['exercises']
    const fromExtra = extra.filter((e) => e.name.trim())

    setState((s) => {
      const session: SessionEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        dayType: day,
        exercises: [...fromSplit, ...fromExtra, notes ? { name: 'Notes', sets: notes } : null].filter(Boolean) as SessionEntry['exercises'],
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
    clearDraft()
    setDraft(emptyDraft(todayOption))
  }

  return (
    <GlassCard glow="var(--color-accent)">
      <SectionTitle trailing={
        <button onClick={discardDraft} className="text-[10px] font-semibold text-[var(--color-text-3)] transition-colors hover:text-[var(--color-accent)]">
          Discard draft
        </button>
      }>
        Log Workout Session
      </SectionTitle>
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
              const sets = setsFor(name)
              return (
                <div key={name} className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="text-[12px] font-semibold leading-snug">{name}</div>
                    {sets.length > 0 && (
                      <span className="shrink-0 font-[var(--font-mono)] text-[9.5px] text-[var(--color-text-3)]">
                        {sets.length} set{sets.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {sets.length > 0 && (
                    <div className="mb-2 space-y-1.5">
                      {sets.map((s, i) => {
                        const rpeNum = s.rpe ? Number(s.rpe) : null
                        const rpeDelta = rpeNum && targetRpe ? rpeNum - targetRpe : null
                        return (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="w-4 shrink-0 text-center font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">{i + 1}</span>
                            <input
                              value={s.reps}
                              onChange={(e) => updateSet(name, i, 'reps', e.target.value)}
                              type="number"
                              placeholder="Reps"
                              className="w-full min-w-0 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[11.5px] outline-none focus:border-[var(--color-accent)]"
                            />
                            <input
                              value={s.weight}
                              onChange={(e) => updateSet(name, i, 'weight', e.target.value)}
                              type="number"
                              placeholder="kg"
                              className="w-full min-w-0 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[11.5px] outline-none focus:border-[var(--color-accent)]"
                            />
                            <input
                              value={s.rpe}
                              onChange={(e) => updateSet(name, i, 'rpe', e.target.value)}
                              type="number"
                              min={1}
                              max={10}
                              placeholder="RPE"
                              className="w-full min-w-0 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[11.5px] outline-none focus:border-[var(--color-accent)]"
                            />
                            {rpeDelta !== null && (
                              <span
                                className="w-7 shrink-0 text-center text-[9.5px] font-bold"
                                style={{ color: rpeDelta === 0 ? 'var(--color-green)' : rpeDelta > 0 ? 'var(--color-accent)' : 'var(--color-text-3)' }}
                              >
                                {rpeDelta === 0 ? '✓' : rpeDelta > 0 ? `+${rpeDelta}` : rpeDelta}
                              </span>
                            )}
                            <button onClick={() => removeSet(name, i)} className="shrink-0 text-[var(--color-text-3)] transition-colors hover:text-[var(--color-accent)]">
                              <XIcon width={12} height={12} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <button
                    onClick={() => addSet(name)}
                    className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-white/15 py-1.5 text-[10.5px] font-semibold text-[var(--color-text-3)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-2)]"
                  >
                    <PlusIcon width={11} height={11} /> Add Set
                  </button>
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

type HistoryTab = 'workouts' | 'activity'

function History() {
  const [tab, setTab] = useState<HistoryTab>('workouts')
  return (
    <div className="space-y-3">
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'workouts', label: 'Workouts' },
          { value: 'activity', label: 'Activity' },
        ]}
      />
      {tab === 'workouts' ? <WorkoutHistory /> : <ActivityHistory />}
    </div>
  )
}

function WorkoutHistory() {
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
            <div key={ei} className="mt-1.5 flex justify-between gap-3 text-[11.5px] text-[var(--color-text-2)]">
              <span>{ex.name}</span>
              <span className="text-right font-[var(--font-mono)] text-[var(--color-text-3)]">{ex.sets}</span>
            </div>
          ))}
        </motion.div>
      ))}
    </GlassCard>
  )
}

interface ActivityRow {
  id: string
  date: string
  icon: string
  label: string
  source: 'food' | 'activity'
}

function ActivityHistory() {
  const { state, setState } = useStore()
  const combined = useMemo<ActivityRow[]>(() => {
    const foodRows: ActivityRow[] = state.food.map((f) => ({
      id: f.id,
      date: f.date,
      icon: '🍽️',
      label: `${f.name} — ${f.k} kcal (${f.p}P / ${f.c}C / ${f.f}F)`,
      source: 'food',
    }))
    const activityRows: ActivityRow[] = state.activityLog.map((a) => ({ id: a.id, date: a.date, icon: a.icon, label: a.label, source: 'activity' }))
    return [...foodRows, ...activityRows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [state.food, state.activityLog])

  const del = (row: ActivityRow) =>
    setState((s) =>
      row.source === 'food' ? { ...s, food: s.food.filter((f) => f.id !== row.id) } : { ...s, activityLog: s.activityLog.filter((a) => a.id !== row.id) },
    )

  return (
    <GlassCard>
      <SectionTitle trailing={<span className="font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">{combined.length} total</span>}>
        Activity
      </SectionTitle>
      {combined.length === 0 && (
        <div className="py-8 text-center text-[12.5px] leading-relaxed text-[var(--color-text-3)]">
          Nothing logged yet — water, supplements, meals, steps, and habit check-offs show up here as you log them.
        </div>
      )}
      {combined.map((row, i) => (
        <motion.div
          key={`${row.source}-${row.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i, 12) * 0.02 }}
          className="flex items-center gap-3 border-b border-white/[0.06] py-2.5 last:border-none"
        >
          <span className="shrink-0 text-base">{row.icon}</span>
          <span className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-semibold">{row.label}</div>
            <div className="text-[10px] text-[var(--color-text-3)]">{new Date(row.date).toLocaleString()}</div>
          </span>
          <button onClick={() => del(row)} className="shrink-0 text-[var(--color-text-3)] transition-colors hover:text-[var(--color-accent)]">
            <XIcon width={13} height={13} />
          </button>
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
    const wasDone = !!state.habits[key]
    setState((s) => ({ ...s, habits: { ...s.habits, [key]: !s.habits[key] } }))
    if (!wasDone) {
      const h = HABITS.find((x) => x.key === key)
      if (h) pushActivity(setState, h.icon, h.name)
    }
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

      const sessionRows: Record<string, string | number>[] = state.sessions
        .filter((s) => inRange(s.date))
        .flatMap((s) =>
          s.exercises.flatMap((e): Record<string, string | number>[] => {
            const base = { Date: new Date(s.date).toLocaleDateString(), 'Day Type': s.dayType, Exercise: e.name, Detail: e.sets }
            return e.raw?.length
              ? e.raw.map((set, i) => ({ ...base, Set: i + 1, Reps: set.reps, 'Weight (kg)': set.weightKg, RPE: set.rpe ?? '' }))
              : [{ ...base, Set: '', Reps: '', 'Weight (kg)': '', RPE: '' }]
          }),
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
