import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue } from 'motion/react'

const POS_KEY = 'gm5-coach-fab-pos'
const SIZE = 56
const MARGIN = 12

function defaultPos() {
  return {
    x: window.innerWidth - SIZE - MARGIN,
    y: window.innerHeight - SIZE - MARGIN - 92, // clears the bottom dock nav
  }
}

function clamp(pos: { x: number; y: number }) {
  const maxX = window.innerWidth - SIZE - MARGIN
  const maxY = window.innerHeight - SIZE - MARGIN
  return { x: Math.min(Math.max(pos.x, MARGIN), maxX), y: Math.min(Math.max(pos.y, MARGIN), maxY) }
}

/** A floating button you can drag anywhere on screen — position persists across reloads
 *  (localStorage) and stays clamped inside the viewport, including after a resize. */
export function DraggableFab({
  children,
  onActivate,
  label,
  style,
  className = '',
}: {
  children: ReactNode
  onActivate: () => void
  label: string
  style?: React.CSSProperties
  className?: string
}) {
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem(POS_KEY)
      return saved ? clamp(JSON.parse(saved)) : defaultPos()
    } catch {
      return defaultPos()
    }
  })
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const dragged = useRef(false)

  useEffect(() => {
    const onResize = () => setPos((p) => clamp(p))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <motion.button
      drag
      dragMomentum={false}
      dragElastic={0}
      style={{ ...style, x, y, position: 'fixed', left: pos.x, top: pos.y }}
      onDragStart={() => {
        dragged.current = false
      }}
      onDrag={(_, info) => {
        if (Math.hypot(info.offset.x, info.offset.y) > 6) dragged.current = true
      }}
      onDragEnd={(_, info) => {
        const next = clamp({ x: pos.x + info.offset.x, y: pos.y + info.offset.y })
        setPos(next)
        x.set(0)
        y.set(0)
        localStorage.setItem(POS_KEY, JSON.stringify(next))
      }}
      onClick={() => {
        if (dragged.current) {
          dragged.current = false
          return
        }
        onActivate()
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={label}
      className={`z-40 grid h-14 w-14 touch-none place-items-center rounded-full text-white ${className}`}
    >
      {children}
    </motion.button>
  )
}
