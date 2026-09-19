// Canonical source of truth for scheduled reminders. The Worker's Cron Trigger fires
// every minute (wrangler.toml [triggers] crons = ["* * * * *"]) — Cloudflare's Workers
// Free plan caps cron triggers at 5 per account, nowhere near the 25 distinct times this
// needs, so instead of 25 triggers there's 1, and the scheduled handler (index.ts) does
// its own IST-time matching against this table every time it fires.
//
// Every `hour`/`minute` is IST (UTC+5:30) wall-clock time. `days`, when present, restricts
// which days it fires on: 0=Sunday..6=Saturday (this is just our own array index — not
// tied to any platform's cron day numbering, since there's no cron day field here anymore).

export const LINK = 'https://i-abhishekkk.github.io/Fitness-app/today'

export interface ReminderEntry {
  hour: number
  minute: number
  days?: number[] // 0=Sun..6=Sat; omit for every day
  title: string
  body: string
}

const WEEKDAYS = [1, 2, 3, 4, 5]
const SATURDAY = [6]
const SUNDAY = [0]

export const REMINDERS: ReminderEntry[] = [
  // --- Weekly body check-in — Sunday 9:00 AM ---
  { hour: 9, minute: 0, days: SUNDAY, title: '📏 Weekly Check-in', body: "It's Sunday — log this week's weight and body measurements (Progress → Body)." },

  // --- Water — 6x/day, every day ---
  { hour: 7, minute: 0, title: '💧 Water #1 of 6', body: 'Start hydrating — first glass of the day.' },
  { hour: 9, minute: 30, title: '💧 Water #2 of 6', body: 'Keep it up — stay ahead of the target.' },
  { hour: 12, minute: 0, title: '💧 Water #3 of 6', body: 'Halfway through the morning — top up.' },
  { hour: 14, minute: 30, title: '💧 Water #4 of 6', body: "Afternoon check-in — how's your intake?" },
  { hour: 17, minute: 0, title: '💧 Water #5 of 6', body: 'Evening push — close the gap before dinner.' },
  { hour: 20, minute: 0, title: '💧 Water #6 of 6', body: 'Last one — hit your daily target before bed.' },

  // --- Supplements ---
  { hour: 8, minute: 0, title: '💊 Collagen', body: 'Take collagen now — 30 min before gym.' },
  { hour: 8, minute: 15, title: '💊 Creatine', body: 'Take creatine now, on your way to the gym.' },
  { hour: 10, minute: 0, title: '💊 Multivitamin + Fish Oil', body: 'Take both right after your post-workout meal.' },
  { hour: 14, minute: 0, title: '💊 Vitamin B12', body: 'Take B12 now, after your afternoon meal.' },
  { hour: 22, minute: 30, title: '💊 Magnesium (ZMA)', body: 'Take magnesium now — 30 min before sleep.' },
  { hour: 14, minute: 15, days: SUNDAY, title: '💊 Vitamin D3', body: 'Take D3 now, right after Sunday lunch.' },

  // --- Meals — weekday (Mon–Fri: Pull/Push/Leg days share the same times) ---
  { hour: 6, minute: 20, days: WEEKDAYS, title: '🍽️ Meal 1 — Pre-Workout', body: 'Bananas + soaked dry fruits. Fuel up before skill work.' },
  { hour: 9, minute: 45, days: WEEKDAYS, title: '🍽️ Meal 2 — Post-Workout', body: 'Anabolic window — eat now, right after the gym.' },
  { hour: 13, minute: 30, days: WEEKDAYS, title: '🍽️ Meal 3 — Lunch', body: "Office lunch time — don't skip the shake." },
  { hour: 19, minute: 30, days: WEEKDAYS, title: '🍽️ Meal 4 — Dinner', body: "Anchor dinner — the day's biggest meal." },

  // --- Meals — Saturday (HS + Park day) ---
  { hour: 7, minute: 30, days: SATURDAY, title: '🍽️ Meal 1 — Post-HS Breakfast', body: 'HS session done — eat now.' },
  { hour: 12, minute: 0, days: SATURDAY, title: '🍽️ Meal 2 — Post-Park Recovery', body: 'Double-session recovery meal — the big one.' },
  { hour: 14, minute: 30, days: SATURDAY, title: '🍽️ Meal 3 — Afternoon', body: 'Sattu/moong + chicken — shifted Saturday timing.' },
  { hour: 19, minute: 30, days: SATURDAY, title: '🍽️ Meal 4 — Dinner', body: 'Bulk shake + dinner combined tonight.' },

  // --- Meals — Sunday (Rest day) ---
  { hour: 9, minute: 15, days: SUNDAY, title: '🍽️ Meal 1 — Relaxed Breakfast', body: 'No rush — bananas + dry fruits.' },
  { hour: 10, minute: 30, days: SUNDAY, title: '🍽️ Meal 2 — Breakfast', body: 'Standard egg bites + oats, same as training days.' },
  { hour: 13, minute: 30, days: SUNDAY, title: '🍽️ Meal 3 — Lunch', body: "Today's reduced-carb meal — the day's only cut." },
  { hour: 20, minute: 30, days: SUNDAY, title: '🍽️ Meal 4 — Dinner', body: "Anchor dinner — don't reduce this one." },
]

/** Finds the reminder (if any) whose IST hour/minute/day matches `now`. Only one entry
 *  should ever match a given wall-clock minute — the two Sunday 2:00-2:15pm-ish entries
 *  (B12 daily vs D3 weekly) are deliberately offset by 15 min so they never collide. */
export function findDueReminder(now: Date): ReminderEntry | null {
  const istTotalMin = (now.getUTCHours() * 60 + now.getUTCMinutes() + 330) % 1440
  const istHour = Math.floor(istTotalMin / 60)
  const istMinute = istTotalMin % 60
  const dayRolledOver = now.getUTCHours() * 60 + now.getUTCMinutes() + 330 >= 1440
  const istDay = (now.getUTCDay() + (dayRolledOver ? 1 : 0)) % 7

  return (
    REMINDERS.find((r) => r.hour === istHour && r.minute === istMinute && (!r.days || r.days.includes(istDay))) ??
    null
  )
}
