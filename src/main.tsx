import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import App from './App'
import './index.css'

// StrictMode's dev-only double-effect-invoke conflicts with motion/react's
// AnimatePresence mount animations (stuck at initial opacity/transform), so
// it's intentionally left off here.
createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <StoreProvider>
      <App />
    </StoreProvider>
  </BrowserRouter>,
)
