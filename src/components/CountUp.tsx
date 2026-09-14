import { useEffect, useRef } from 'react'
import { animate, useMotionValue, useTransform, motion } from 'motion/react'

export function CountUp({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
}: {
  value: number
  decimals?: number
  suffix?: string
  prefix?: string
  className?: string
}) {
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`)
  const prev = useRef(0)

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.8, ease: [0.16, 1, 0.3, 1] })
    prev.current = value
    return controls.stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <motion.span className={className}>{text}</motion.span>
}
