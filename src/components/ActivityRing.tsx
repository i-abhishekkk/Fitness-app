import { motion } from 'motion/react'
import { useId, type ReactNode } from 'react'

export function ActivityRing({
  pct,
  size = 76,
  stroke = 8,
  color = 'var(--color-accent)',
  color2,
  trackColor = 'rgba(255,255,255,0.07)',
  glow = false,
  children,
}: {
  pct: number
  size?: number
  stroke?: number
  color?: string
  color2?: string
  trackColor?: string
  glow?: boolean
  children?: ReactNode
}) {
  const gid = useId()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {color2 && (
          <defs>
            <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={color2} />
            </linearGradient>
          </defs>
        )}
        <circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color2 ? `url(#${gid})` : color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          style={glow ? { filter: `drop-shadow(0 0 6px ${color}99)` } : undefined}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (clamped / 100) * c }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}

export function StackedRings({
  rings,
  size = 132,
  children,
}: {
  rings: { pct: number; color: string; color2?: string }[]
  size?: number
  children?: ReactNode
}) {
  const stroke = Math.max(6, Math.round(size / 15))
  const gap = stroke + 3
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {rings.map((ring, i) => {
        const s = size - i * gap * 2
        return (
          <div key={i} className="absolute inset-0 flex items-center justify-center">
            <ActivityRing pct={ring.pct} size={s} stroke={stroke} color={ring.color} color2={ring.color2} glow />
          </div>
        )
      })}
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}
