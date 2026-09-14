import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path must match the GitHub Pages repo name (https://<user>.github.io/<repo>/).
// Overridden at build time in CI via VITE_BASE_PATH; defaults to '/' for local dev.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
