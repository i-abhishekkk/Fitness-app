import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import Today from './pages/Today'
import Train from './pages/Train'
import Diet from './pages/Diet'
import Tracker from './pages/Tracker'
import Progress from './pages/Progress'

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

export default function App() {
  const location = useLocation()
  return (
    <div className="grain relative mx-auto min-h-screen max-w-[460px] pb-28">
      <div className="mesh-bg" />
      <Header />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/today" element={<Page><Today /></Page>} />
          <Route path="/train" element={<Page><Train /></Page>} />
          <Route path="/diet" element={<Page><Diet /></Page>} />
          <Route path="/tracker" element={<Page><Tracker /></Page>} />
          <Route path="/progress" element={<Page><Progress /></Page>} />
        </Routes>
      </AnimatePresence>
      <BottomNav />
    </div>
  )
}
