import { useEffect, useState } from 'react'
import { ActivityRing } from './ActivityRing'
import { UserIcon, LogOutIcon } from './icons'
import { useStore } from '../store/StoreContext'
import { signInWithGoogle, signOut } from '../lib/firebase'
import { calcAge, getTodayCfg, DIET_TARGETS, WEIGHT_BASELINE, CHECKLISTS } from '../data/plan'

export function Header() {
  const { state, user, cloudEnabled } = useStore()
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const cfg = getTodayCfg()
  const targets = DIET_TARGETS[cfg.type]
  const items = CHECKLISTS[cfg.type]
  const doneCount = items.filter((i) => state.checklist[i.id]).length
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0
  const streak = state.streakDays.length
  const weight = state.weights.at(-1)?.kg ?? WEIGHT_BASELINE

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border-2)] bg-[var(--color-bg)]/95 backdrop-blur px-4 pt-3 pb-3">
      <div className="flex items-center gap-2.5">
        <span className="rounded-md bg-[var(--color-accent)] px-2.5 py-1 font-[var(--font-display)] text-[11px] tracking-[3px] text-white">
          GOD MODE
        </span>
        <div className="flex-1 min-w-0">
          <div className="truncate font-[var(--font-display)] text-xl tracking-wide">ABHISHEK SINGH</div>
        </div>
        <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--color-green)]/30 bg-[var(--color-green-dim)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-green)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-green)] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-green)]" />
          </span>
          {time}
        </span>
        {cloudEnabled &&
          (user ? (
            <button
              onClick={() => signOut()}
              className="grid h-8 w-8 place-items-center rounded-full border border-[var(--color-border-2)] text-[var(--color-text-2)] active:scale-90 transition-transform"
              aria-label="Sign out"
              title={user.displayName ?? 'Sign out'}
            >
              <LogOutIcon width={15} height={15} />
            </button>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="grid h-8 w-8 place-items-center rounded-full border border-[var(--color-border-2)] text-[var(--color-text-2)] active:scale-90 transition-transform"
              aria-label="Sign in"
            >
              <UserIcon width={15} height={15} />
            </button>
          ))}
      </div>

      <div className="mt-1.5 font-[var(--font-mono)] text-[10px] text-[var(--color-text-3)]">
        {calcAge()} yo · 5'11" · Hybrid Athlete · 6-Day/Week · Handstand → Muscle-Up Protocol
      </div>

      <div className="mt-3 flex items-center gap-4">
        <ActivityRing pct={pct} size={72} stroke={7}>
          <div className="text-center">
            <div className="font-[var(--font-mono)] text-base font-extrabold leading-none">{pct}%</div>
            <div className="mt-0.5 text-[8px] leading-none text-[var(--color-text-3)]">missions</div>
          </div>
        </ActivityRing>
        <div className="grid flex-1 grid-cols-4 gap-1.5">
          <Stat label="kcal today" value={String(targets.kcal)} accent="var(--color-accent)" />
          <Stat label="protein" value={`${targets.p}g`} accent="var(--color-blue)" />
          <Stat label="day streak" value={String(streak)} accent="var(--color-purple)" />
          <Stat label="kg now" value={weight.toFixed(1)} accent="var(--color-green)" />
        </div>
      </div>
    </header>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-bg-3)] px-1 py-1.5 text-center">
      <span className="absolute inset-x-0 top-0 h-[2px]" style={{ background: accent }} />
      <div className="font-[var(--font-mono)] text-sm font-extrabold">{value}</div>
      <div className="mt-0.5 text-[8.5px] text-[var(--color-text-3)]">{label}</div>
    </div>
  )
}
