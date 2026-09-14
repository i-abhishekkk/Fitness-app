import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
})

export const BoltIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></svg>
)
export const DumbbellIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11" />
  </svg>
)
export const SaladIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 12h18a9 9 0 0 1-18 0Z" />
    <path d="M12 12V4M8 12 6 6M16 12l2-6" />
  </svg>
)
export const ChartBarIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 20V10M12 20V4M20 20v-7" />
  </svg>
)
export const TrendingUpIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
)
export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M20 6 9 17l-5-5" /></svg>
)
export const DropletIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 2.7s6 7 6 11.3a6 6 0 1 1-12 0c0-4.3 6-11.3 6-11.3Z" /></svg>
)
export const FootprintsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 6.5c1.5 0 2.5 1.3 2.5 3.2 0 2-1 3-1 5 0 1.4.8 2.3.8 2.3-.6.6-2.1.6-2.6-.3-.6-1-1-2.3-1-4C7.7 10.4 7.5 6.5 9 6.5Z" />
    <path d="M16 10.5c1.5 0 2.5 1.3 2.5 3.2 0 2-1 3-1 5 0 1.4.8 2.3.8 2.3-.6.6-2.1.6-2.6-.3-.6-1-1-2.3-1-4-.5-2.3-.7-6.2.3-6.2Z" />
  </svg>
)
export const PillIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="9.5" width="17" height="7" rx="3.5" transform="rotate(-35 12 13)" />
    <path d="m9.5 9.5 3.6 5.9" />
  </svg>
)
export const ChevronDownIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
)
export const FlameIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 2s-6 5.5-6 11a6 6 0 0 0 12 0c0-1.6-.7-2.7-1.4-3.8-.3.9-.8 1.6-1.6 1.9C15.6 8 12 6 12 2Z" />
  </svg>
)
export const UserIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.6-3.6 4.8-5.5 8-5.5S18.4 16.4 20 20" />
  </svg>
)
export const LogOutIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
)
export const PlusIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
)
