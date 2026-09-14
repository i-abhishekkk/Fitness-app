import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
  accent,
}: {
  children: ReactNode
  className?: string
  accent?: string
}) {
  return (
    <div
      className={`rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-2)] p-3.5 ${className}`}
      style={accent ? { borderLeft: `3px solid ${accent}` } : undefined}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <div
      className="mb-2.5 flex items-center gap-2 font-[var(--font-display)] text-[17px] tracking-wide"
      style={color ? { color } : undefined}
    >
      {children}
    </div>
  )
}

export function SectionLabel({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <div
      className="mb-1.5 mt-3 font-[var(--font-mono)] text-[9px] font-bold uppercase tracking-[1.2px] text-[var(--color-text-3)] first:mt-0"
      style={color ? { color } : undefined}
    >
      {children}
    </div>
  )
}

export function ProgressBar({ pct, color }: { pct: number; color: string }) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="mb-2 h-[7px] overflow-hidden rounded-full bg-[var(--color-bg-4)]">
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${clamped}%`, background: color }}
      />
    </div>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="mb-3 flex gap-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-3)] p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="flex-1 whitespace-nowrap rounded-md px-1 py-1.5 text-[10px] font-bold tracking-wide transition-colors"
          style={{
            background: value === o.value ? 'var(--color-accent)' : 'transparent',
            color: value === o.value ? '#fff' : 'var(--color-text-3)',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Callout({ kind, children }: { kind: 'succ' | 'warn' | 'danger' | 'tip'; children: ReactNode }) {
  const map = {
    succ: { color: 'var(--color-green)', dim: 'var(--color-green-dim)' },
    warn: { color: 'var(--color-amber)', dim: 'var(--color-amber-dim)' },
    danger: { color: 'var(--color-accent)', dim: 'var(--color-accent-dim)' },
    tip: { color: 'var(--color-blue)', dim: 'var(--color-blue-dim)' },
  }[kind]
  return (
    <div
      className="mb-2.5 rounded-md border px-2.5 py-2 text-[12px] leading-relaxed"
      style={{ background: map.dim, borderColor: `${map.color}33`, borderLeft: `3px solid ${map.color}`, color: map.color }}
    >
      {children}
    </div>
  )
}

export function Badge({ children, color, dim }: { children: ReactNode; color: string; dim: string }) {
  return (
    <span
      className="inline-block rounded-[3px] px-1.5 py-0.5 font-[var(--font-mono)] text-[9px] font-bold uppercase tracking-wide"
      style={{ background: dim, color, border: `1px solid ${color}40` }}
    >
      {children}
    </span>
  )
}
