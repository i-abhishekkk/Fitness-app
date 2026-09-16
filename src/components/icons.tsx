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
export const XIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>
)
export const TrophyIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" />
    <path d="M7 5H4a1 1 0 0 0-1 1c0 2.5 1.5 4.5 4 4.9M17 5h3a1 1 0 0 1 1 1c0 2.5-1.5 4.5-4 4.9" />
  </svg>
)
export const MoonIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" /></svg>
)
export const TargetIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.6" fill="currentColor" />
  </svg>
)
export const LockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </svg>
)
export const LoaderIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 4a8 8 0 1 0 8 8" /></svg>
)
export const CheckCircleIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><path d="m8.2 12.3 2.6 2.6 5-5.2" /></svg>
)
export const DownloadIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 3v13M7 11l5 5 5-5M4.5 20h15" /></svg>
)
export const TrashIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 7h14M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M7 7l1 13a1.5 1.5 0 0 0 1.5 1.4h5a1.5 1.5 0 0 0 1.5-1.4l1-13" />
  </svg>
)
export const ShieldIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 3.5 5 6v6c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5V6l-7-2.5Z" /><path d="m9 12 2.2 2.2L15.5 10" /></svg>
)
export const HeartIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 20.3s-7.5-4.7-9.7-9.4C.6 7.2 2.5 4 6 4c2 0 3.5 1 6 3.5C14.5 5 16 4 18 4c3.5 0 5.4 3.2 3.7 6.9-2.2 4.7-9.7 9.4-9.7 9.4Z" /></svg>
)
export const ScaleIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v18M5 7h14M5 7 3 12a2.5 2.5 0 0 0 5 0L6 7Z" /><path d="M18 7l-2 5a2.5 2.5 0 0 0 5 0l-2-5Z" /><path d="M8 21h8" />
  </svg>
)
export const SparklesIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M18.5 5.5l-2.8 2.8M8.3 15.7l-2.8 2.8" />
  </svg>
)
export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
)
export const AwardIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="8.5" r="5.5" /><path d="m8.5 13 -1.8 7.5L12 18l5.3 2.5L15.5 13" /></svg>
)
export const ShareIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 15V4M8 8l4-4 4 4" />
    <path d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12" />
  </svg>
)
export const SmartphoneIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="6" y="2.5" width="12" height="19" rx="2.2" />
    <path d="M11 18.2h2" />
  </svg>
)
export const BellIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9Z" />
    <path d="M9.5 17.5a2.5 2.5 0 0 0 5 0" />
  </svg>
)
export const SendIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M4.5 12 20 4.5 14.5 20l-2.8-6.7L4.5 12Z" /></svg>
)
export const BotIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="8.5" width="16" height="11" rx="3.5" />
    <path d="M12 8.5V5M9 4.5h6" />
    <circle cx="9" cy="14" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="14" r="1.2" fill="currentColor" stroke="none" />
    <path d="M2 13v2M22 13v2" />
  </svg>
)
