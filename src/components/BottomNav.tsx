import { NavLink } from 'react-router-dom'
import { BoltIcon, DumbbellIcon, SaladIcon, ChartBarIcon, TrendingUpIcon } from './icons'

const TABS = [
  { to: '/today', label: 'TODAY', Icon: BoltIcon },
  { to: '/train', label: 'TRAIN', Icon: DumbbellIcon },
  { to: '/diet', label: 'DIET', Icon: SaladIcon },
  { to: '/tracker', label: 'TRACK', Icon: ChartBarIcon },
  { to: '/progress', label: 'PROGRESS', Icon: TrendingUpIcon },
]

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[480px] border-t border-[var(--color-border-2)] bg-[var(--color-bg-2)]/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2.5 pb-3 text-[8.5px] font-bold tracking-wide transition-colors active:scale-95 ${
              isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-3)]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon width={20} height={20} strokeWidth={isActive ? 2.1 : 1.8} />
              <span>{label}</span>
              <span
                className="mt-0.5 h-[2px] w-5 rounded-full bg-[var(--color-accent)] transition-opacity"
                style={{ opacity: isActive ? 1 : 0 }}
              />
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
