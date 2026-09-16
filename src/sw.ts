/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
import { firebaseConfig, firebaseEnabled } from './lib/firebaseConfig'

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
cleanupOutdatedCaches()

// Serve the app shell for any in-scope navigation once this SW is active, so
// installed-app deep links (e.g. /today) resolve instantly and offline instead of
// depending on the GitHub Pages 404.html redirect trick (still the fallback for the
// very first, not-yet-installed visit).
precacheAndRoute(self.__WB_MANIFEST)
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))

registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' }),
)
registerRoute(
  /^https:\/\/fonts\.gstatic\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [new ExpirationPlugin({ maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 365 })],
  }),
)

// Push notifications received while the app isn't in the foreground surface here —
// foreground messages are handled separately in lib/firebase.ts's watchForegroundPush.
if (firebaseEnabled) {
  const app = initializeApp(firebaseConfig)
  const messaging = getMessaging(app)
  onBackgroundMessage(messaging, (payload) => {
    const title = payload.notification?.title ?? 'GOD MODE'
    const body = payload.notification?.body
    self.registration.showNotification(title, { body, icon: 'icons/icon-192.png' })
  })
}
