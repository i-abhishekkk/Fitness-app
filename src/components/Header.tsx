import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { StackedRings } from './ActivityRing'
import { UserIcon, LogOutIcon, FlameIcon } from './icons'
import { CountUp } from './CountUp'
import { useStore } from '../store/StoreContext'
import { signInWithGoogle, signOut } from '../lib/firebase'
import { calcAge, getTodayCfg, DIET_TARGETS, WEIGHT_BASELINE, CHECKLISTS, WATER_TARGET_L, STEPS_TARGET } from '../data/plan'

function greeting(hour: number) {
  if (hour < 5) return 'Still up'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Wind down'
}

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
  const missionPct = items.length ? Math.round((doneCount / items.length) * 100) : 0
  const waterPct = Math.min(100, ((state.water * 250) / (WATER_TARGET_L * 1000)) * 100)
  const stepsPct = Math.min(100, (state.steps / STEPS_TARGET) * 100)
  const streak = state.streakDays.length
  const weight = state.weights.at(-1)?.kg ?? WEIGHT_BASELINE

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const firstName = 'Abhishek'

  return (
    <header className="relative px-4 pb-5 pt-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-2.5 py-0.5 font-[var(--font-display)] text-[10px] font-bold tracking-[2.5px] text-white">
              GOD MODE
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--color-green)]/25 bg-[var(--color-green-dim)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-green)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-green)] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-green)]" />
              </span>
              {time}
            </span>
          </div>
          <h1 className="mt-2 truncate font-[var(--font-display)] text-[26px] font-semibold leading-tight tracking-tight">
            {greeting(now.getHours())}, {firstName}
          </h1>
          <div className="mt-1 font-[var(--font-mono)] text-[11px] text-[var(--color-text-3)]">
            {calcAge()}yo · Hybrid Athlete · {cfg.label}
          </div>
        </div>
        {cloudEnabled &&
          (user ? (
            <button
              onClick={() => signOut()}
              className="glass grid h-10 w-10 shrink-0 place-items-center rounded-full text-[var(--color-text-2)] active:scale-90 transition-transform"
              aria-label="Sign out"
              title={user.displayName ?? 'Sign out'}
            >
              <LogOutIcon width={16} height={16} />
            </button>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="glass grid h-10 w-10 shrink-0 place-items-center rounded-full text-[var(--color-text-2)] active:scale-90 transition-transform"
              aria-label="Sign in"
            >
              <UserIcon width={16} height={16} />
            </button>
          ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-strong mt-4 flex items-center gap-4 rounded-2xl p-4"
      >
        <StackedRings
          size={100}
          rings={[
            { pct: missionPct, color: 'var(--color-accent)', color2: 'var(--color-accent-2)' },
            { pct: waterPct, color: 'var(--color-blue)' },
            { pct: stepsPct, color: 'var(--color-teal)' },
          ]}
        >
          <div className="text-center leading-none">
            <div className="font-[var(--font-display)] text-lg font-bold">
              <CountUp value={missionPct} suffix="%" />
            </div>
            <div className="mt-0.5 text-[8px] font-semibold uppercase tracking-wide text-[var(--color-text-3)]">today</div>
          </div>
        </StackedRings>
        <div className="grid flex-1 grid-cols-2 gap-2">
          <Stat icon={<FlameIcon width={13} height={13} />} label="day streak" value={streak} accent="var(--color-amber)" />
          <Stat label="kg now" value={weight} decimals={1} accent="var(--color-green)" />
          <Stat label="kcal target" value={targets.kcal} accent="var(--color-accent)" />
          <Stat label="protein g" value={targets.p} accent="var(--color-blue)" />
        </div>
      </motion.div>
    </header>
  )
}

function Stat({ label, value, decimals = 0, accent, icon }: { label: string; value: number; decimals?: number; accent: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.03] px-2.5 py-2">
      <div className="flex items-center gap-1 font-[var(--font-mono)] text-sm font-extrabold" style={{ color: accent }}>
        {icon}
        <CountUp value={value} decimals={decimals} />
      </div>
      <div className="mt-0.5 text-[9px] text-[var(--color-text-3)]">{label}</div>
    </div>
  )
}
