import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BotIcon, SendIcon, SparklesIcon, XIcon } from './icons'
import { Button } from './ui'
import { DraggableFab } from './DraggableFab'
import { useStore } from '../store/StoreContext'
import { buildCoachContext } from '../lib/coachContext'
import { askCoach, type CoachChatMessage } from '../lib/coachApi'
import { saveCoachMessage, loadCoachHistory, type CoachMessage } from '../lib/coachStore'
import { haptic } from '../lib/haptics'

const STARTERS = ['Review my week', "How's my handstand progress?", 'Suggest a new exercise for me', 'Suggest a high-protein meal']

export function CoachChat() {
  const { state, user } = useStore()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<CoachMessage[]>([])
  const [loadedHistory, setLoadedHistory] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !user || loadedHistory) return
    setLoadedHistory(true)
    loadCoachHistory(user.uid).then(setMessages)
  }, [open, user, loadedHistory])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  const send = async (text: string) => {
    if (!user || !text.trim() || busy) return
    haptic()
    setError(null)
    const userMsg: CoachMessage = { role: 'user', content: text.trim() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setBusy(true)

    // Save the user's turn immediately, independent of whether the reply succeeds —
    // a failed AI call should never also lose what was actually typed.
    saveCoachMessage(user.uid, 'user', userMsg.content).catch(() => {})

    try {
      const context = buildCoachContext(state)
      const history: CoachChatMessage[] = [...messages, userMsg].slice(-20).map((m) => ({ role: m.role, content: m.content }))
      const reply = await askCoach(user, userMsg.content, context, history)
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
      saveCoachMessage(user.uid, 'assistant', reply).catch(() => {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {user && (
        <DraggableFab
          label="Open GOD MODE Coach"
          onActivate={() => setOpen(true)}
          style={{
            background: 'linear-gradient(135deg, var(--color-purple), var(--color-accent))',
            boxShadow: '0 10px 30px -8px color-mix(in srgb, var(--color-purple) 60%, transparent)',
          }}
        >
          <SparklesIcon width={22} height={22} />
        </DraggableFab>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-center bg-black/60"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong flex h-full w-full max-w-[460px] flex-col overflow-hidden"
            >
              <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-4 py-3.5" style={{ paddingTop: 'max(env(safe-area-inset-top), 14px)' }}>
                <span className="grid h-8 w-8 place-items-center rounded-full" style={{ background: 'linear-gradient(135deg, var(--color-purple), var(--color-accent))' }}>
                  <BotIcon width={16} height={16} style={{ color: 'white' }} />
                </span>
                <div>
                  <div className="font-[var(--font-display)] text-[14px] font-semibold">GOD MODE Coach</div>
                  <div className="text-[10px] text-[var(--color-text-3)]">Grounded on your actual training data</div>
                </div>
                <button onClick={() => setOpen(false)} className="ml-auto grid h-8 w-8 place-items-center rounded-full text-[var(--color-text-3)] transition-colors hover:bg-white/5">
                  <XIcon width={16} height={16} />
                </button>
              </div>

              <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4">
                {messages.length === 0 && !busy && (
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                    <span className="grid h-14 w-14 place-items-center rounded-full" style={{ background: 'linear-gradient(135deg, var(--color-purple), var(--color-accent))' }}>
                      <SparklesIcon width={24} height={24} style={{ color: 'white' }} />
                    </span>
                    <div className="text-[13px] text-[var(--color-text-2)]">
                      Ask about your progress, plateaus, or what to adjust — or ask for new exercise or meal ideas beyond your current plan. Facts stay grounded in your logged data; suggestions draw on general coaching knowledge too.
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {STARTERS.map((s) => (
                        <button key={s} onClick={() => send(s)} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11.5px] text-[var(--color-text-2)] transition-colors hover:bg-white/[0.07]">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {messages.map((m, i) => (
                    <div key={m.id ?? i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${m.role === 'user' ? 'text-white' : 'glass text-[var(--color-text)]'}`}
                        style={m.role === 'user' ? { background: 'linear-gradient(135deg, var(--color-purple), var(--color-accent))' } : undefined}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {busy && (
                    <div className="flex justify-start">
                      <div className="glass flex gap-1 rounded-2xl px-4 py-3">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-3)]"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] bg-[var(--color-accent-dim)] px-3.5 py-2.5 text-[12px] text-[var(--color-text-2)]">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-white/[0.08] px-4 py-3" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 14px)' }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send(input)}
                  disabled={busy}
                  placeholder="Ask your coach..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[13px] outline-none focus:border-[var(--color-purple)] disabled:opacity-50"
                />
                <Button variant="secondary" color="var(--color-purple)" disabled={busy || !input.trim()} onClick={() => send(input)}>
                  <SendIcon width={15} height={15} />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
