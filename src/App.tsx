import { Navigate, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import Today from './pages/Today'
import Train from './pages/Train'
import Diet from './pages/Diet'
import Tracker from './pages/Tracker'
import Progress from './pages/Progress'

export default function App() {
  return (
    <div className="grain mx-auto min-h-screen max-w-[480px] pb-24">
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route path="/today" element={<Today />} />
        <Route path="/train" element={<Train />} />
        <Route path="/diet" element={<Diet />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/progress" element={<Progress />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
