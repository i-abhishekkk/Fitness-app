import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useInstallPrompt } from '../lib/useInstallPrompt'
import { ShareIcon, SmartphoneIcon, XIcon, PlusIcon } from './icons'
import { Button } from './ui'

const DISMISS_KEY = 'gm5-install-dismissed'

export function InstallBanner() {
  const { isStandalone, canInstallDirectly, showIOSInstructions, promptInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')

  const show = !isStandalone && !dismissed && (canInstallDirectly || showIOSInstructions)

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden px-4"
        >
          <div className="glass-strong relative mb-3 flex items-start gap-3 rounded-2xl p-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--color-accent-dim)] text-[var(--color-accent)]">
              <SmartphoneIcon width={17} height={17} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-bold">Install GOD MODE</div>
              {canInstallDirectly ? (
                <>
                  <div className="mt-0.5 text-[11px] leading-relaxed text-[var(--color-text-2)]">
                    Add it to your home screen for offline access and a full-screen app feel.
                  </div>
                  <div className="mt-2">
                    <Button onClick={promptInstall}>Install</Button>
                  </div>
                </>
              ) : (
                <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] leading-relaxed text-[var(--color-text-2)]">
                  Tap
                  <ShareIcon width={12} height={12} className="inline shrink-0" />
                  then "Add to Home Screen"
                  <PlusIcon width={11} height={11} className="inline shrink-0 rounded-[3px] border border-[var(--color-text-3)]" />
                </div>
              )}
            </div>
            <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 rounded-lg p-1 text-[var(--color-text-3)] transition-colors hover:bg-white/5">
              <XIcon width={14} height={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
