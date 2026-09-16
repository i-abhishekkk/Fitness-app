import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { InstallBanner } from './components/InstallBanner'

// Route-level code splitting — Progress alone pulls in Recharts, and there's no reason
// a cold load needs all five tabs' JS before the user has even picked one.
const Today = lazy(() => import('./pages/Today'))
const Train = lazy(() => import('./pages/Train'))
const Diet = lazy(() => import('./pages/Diet'))
const Tracker = lazy(() => import('./pages/Tracker'))
const Progress = lazy(() => import('./pages/Progress'))
const CoachChat = lazy(() => import('./components/CoachChat').then((m) => ({ default: m.CoachChat })))

function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

function PageLoader() {
  return (
    <div className="flex justify-center px-4 py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        className="h-6 w-6 rounded-full border-2 border-white/10"
        style={{ borderTopColor: 'var(--color-accent)' }}
      />
    </div>
  )
}

export default function App() {
  const location = useLocation()
  return (
    <div className="grain relative mx-auto min-h-screen max-w-[460px] pb-28">
      <div className="mesh-bg" />
      <Header />
      <InstallBanner />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/today" replace />} />
            <Route path="/today" element={<Page><Today /></Page>} />
            <Route path="/train" element={<Page><Train /></Page>} />
            <Route path="/diet" element={<Page><Diet /></Page>} />
            <Route path="/tracker" element={<Page><Tracker /></Page>} />
            <Route path="/progress" element={<Page><Progress /></Page>} />
          </Routes>
        </Suspense>
      </AnimatePresence>
      <BottomNav />
      <Suspense fallback={null}>
        <CoachChat />
      </Suspense>
    </div>
  )
}
