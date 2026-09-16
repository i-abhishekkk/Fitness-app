import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Base path must match the GitHub Pages repo name (https://<user>.github.io/<repo>/).
// Overridden at build time in CI via VITE_BASE_PATH; defaults to '/' for local dev.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Custom service worker (src/sw.ts) instead of the auto-generated one — it also
      // needs to initialize Firebase Messaging to handle background push notifications,
      // which the plugin's own `workbox`-only `generateSW` strategy can't do.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      // We already hand-author public/manifest.webmanifest and link it in index.html —
      // this just adds the service worker on top, it doesn't generate a second manifest.
      manifest: false,
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  base: process.env.VITE_BASE_PATH || '/',
})
