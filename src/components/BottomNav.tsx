import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { BoltIcon, DumbbellIcon, SaladIcon, ChartBarIcon, TrendingUpIcon } from './icons'

const TABS = [
  { to: '/today', label: 'Today', Icon: BoltIcon },
  { to: '/train', label: 'Train', Icon: DumbbellIcon },
  { to: '/diet', label: 'Diet', Icon: SaladIcon },
  { to: '/tracker', label: 'Track', Icon: ChartBarIcon },
  { to: '/progress', label: 'Progress', Icon: TrendingUpIcon },
]

export function BottomNav() {
  const { pathname } = useLocation()
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-[460px] justify-center px-3"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 14px)' }}
    >
      <div className="glass-strong flex w-full items-center gap-0.5 rounded-2xl p-1.5" style={{ boxShadow: 'var(--shadow-elevated)' }}>
        {TABS.map(({ to, label, Icon }) => {
          const isActive = pathname.startsWith(to)
          return (
            <NavLink key={to} to={to} className="relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5">
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl bg-[var(--color-accent)]/15"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative flex flex-col items-center gap-1" style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-3)' }}>
                <Icon width={19} height={19} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[9.5px] font-semibold tracking-wide">{label}</span>
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
