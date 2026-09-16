import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Base path must match the GitHub Pages repo name (https://<user>.github.io/<repo>/).
// Overridden at build time in CI via VITE_BASE_PATH; defaults to '/' for local dev.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // We already hand-author public/manifest.webmanifest and link it in index.html —
      // this just adds the service worker on top, it doesn't generate a second manifest.
      manifest: false,
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        // Serve the app shell for any in-scope navigation once the SW is active, so
        // installed-app deep links (e.g. /today) resolve instantly and offline instead
        // of depending on the GitHub Pages 404.html redirect trick (still the fallback
        // for the very first, not-yet-installed visit).
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  base: process.env.VITE_BASE_PATH || '/',
})
