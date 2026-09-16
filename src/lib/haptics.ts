/** Fires a short vibration where the Vibration API exists (Android Chrome). iOS Safari
 *  has never implemented it on any WebKit version, so this is a silent no-op there. */
export function haptic(pattern: number | number[] = 8) {
  navigator.vibrate?.(pattern)
}
