import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { motion } from 'motion/react'

/** Alpha-blend a `var(--color-x)` token against a base color — plain `${color}22` hex-suffix
 *  concatenation doesn't work once colors are CSS custom properties instead of hex literals. */
export function mix(color: string, pct: number, base: string = 'transparent') {
  return `color-mix(in srgb, ${color} ${pct}%, ${base})`
}

export function GlassCard({
  children,
  className = '',
  glow,
}: {
  children: ReactNode
  className?: string
  glow?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`glass relative overflow-hidden rounded-2xl p-4 ${className}`}
      style={
        glow
          ? {
              boxShadow: `0 0 0 1px color-mix(in srgb, ${glow} 15%, transparent) inset, 0 24px 48px -28px color-mix(in srgb, ${glow} 45%, transparent)`,
            }
          : undefined
      }
    >
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-3xl"
          style={{ background: glow }}
        />
      )}
      <div className="relative">{children}</div>
    </motion.div>
  )
}

export function SectionTitle({
  children,
  icon,
  color,
  trailing,
}: {
  children: ReactNode
  icon?: ReactNode
  color?: string
  trailing?: ReactNode
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {icon && (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: color ? mix(color, 14) : 'var(--glass-2)', color: color ?? 'var(--color-text)' }}>
          {icon}
        </span>
      )}
      <h3 className="font-[var(--font-display)] text-[15px] font-semibold tracking-tight" style={color ? { color } : undefined}>
        {children}
      </h3>
      {trailing && <div className="ml-auto">{trailing}</div>}
    </div>
  )
}

export function SectionLabel({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <div
      className="mb-2 mt-4 font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--color-text-3)] first:mt-0"
      style={color ? { color } : undefined}
    >
      {children}
    </div>
  )
}

export function ProgressBar({ pct, color, height = 8 }: { pct: number; color: string; height?: number }) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="mb-2 overflow-hidden rounded-full bg-white/[0.06]" style={{ height }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${mix(color, 70, 'black')}, ${color})` }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
  const id = useId()
  return (
    <div className="glass mb-4 flex gap-1 rounded-xl p-1">
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="relative flex-1 whitespace-nowrap rounded-lg px-2 py-2 text-[11.5px] font-semibold tracking-wide transition-colors"
            style={{ color: active ? '#0a0a0c' : 'var(--color-text-2)' }}
          >
            {active && (
              <motion.span
                layoutId={`pill-${id}`}
                className="absolute inset-0 rounded-lg bg-[var(--color-text)]"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

const CALLOUT_MAP = {
  succ: { color: 'var(--color-green)' },
  warn: { color: 'var(--color-amber)' },
  danger: { color: 'var(--color-accent)' },
  tip: { color: 'var(--color-blue)' },
} as const

export function Callout({ kind, children }: { kind: keyof typeof CALLOUT_MAP; children: ReactNode }) {
  const { color } = CALLOUT_MAP[kind]
  return (
    <div
      className="mb-3 rounded-xl px-3.5 py-3 text-[12.5px] leading-relaxed"
      style={{ background: mix(color, 14), border: `1px solid ${mix(color, 30)}`, color: 'var(--color-text-2)' }}
    >
      <span className="font-semibold" style={{ color }}>
        {kind === 'tip' ? 'Tip · ' : kind === 'warn' ? 'Watch · ' : kind === 'danger' ? 'Heads up · ' : 'Nice · '}
      </span>
      {children}
    </div>
  )
}

export function Badge({ children, color, dim }: { children: ReactNode; color: string; dim: string }) {
  return (
    <span
      className="inline-block rounded-md px-2 py-0.5 font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-wide"
      style={{ background: dim, color, border: `1px solid ${mix(color, 40)}` }}
    >
      {children}
    </span>
  )
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  color = 'var(--color-accent)',
  full,
  type = 'button',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  color?: string
  full?: boolean
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  const base = 'relative flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-[13px] font-bold tracking-wide transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100'
  const styles: Record<string, { className: string; style?: React.CSSProperties }> = {
    primary: {
      className: `${base} text-white shadow-lg`,
      style: { background: `linear-gradient(135deg, ${color}, ${mix(color, 80, 'black')})`, boxShadow: `0 8px 24px -8px ${mix(color, 55)}` },
    },
    secondary: {
      className: `${base} glass-strong`,
      style: { color },
    },
    ghost: {
      className: `${base} text-[var(--color-text-2)] hover:bg-white/[0.04]`,
    },
  }
  const s = styles[variant]
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${s.className} ${full ? 'w-full' : ''}`}
      style={s.style}
    >
      {children}
    </motion.button>
  )
}

export function IconButton({ children, onClick, label }: { children: ReactNode; onClick?: () => void; label: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="glass grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--color-text-2)]"
    >
      {children}
    </motion.button>
  )
}

export function Toggle({ on, onToggle, color = 'var(--color-green)' }: { on: boolean; onToggle: () => void; color?: string }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
      style={{ background: on ? color : 'var(--glass-3)' }}
    >
      <motion.span
        className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md"
        animate={{ left: on ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </button>
  )
}

export function TextField(props: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const { label, className = '', ...rest } = props
  return (
    <label className="block">
      {label && <div className="mb-1.5 text-[11px] font-semibold text-[var(--color-text-3)]">{label}</div>}
      <input
        {...rest}
        className={`w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-3)] focus:border-[var(--color-accent)] ${className}`}
      />
    </label>
  )
}

export function TextAreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const { label, className = '', ...rest } = props
  return (
    <label className="block">
      {label && <div className="mb-1.5 text-[11px] font-semibold text-[var(--color-text-3)]">{label}</div>}
      <textarea
        {...rest}
        className={`w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-3)] focus:border-[var(--color-accent)] ${className}`}
      />
    </label>
  )
}

export function SelectField({ label, value, onChange, options }: { label?: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      {label && <div className="mb-1.5 text-[11px] font-semibold text-[var(--color-text-3)]">{label}</div>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-accent)]"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[var(--color-bg-elevated)]">
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Divider() {
  return <div className="my-2 h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, var(--color-border-2), transparent)' }} />
}
