// Maps each cron expression declared in .github/workflows/reminders.yml to the
// notification it should send. Keys must match the `schedule:` entries EXACTLY (GitHub
// passes the matched cron string back as `github.event.schedule`) — see send-reminder.mjs.
//
// All times are IST (UTC+5:30); cron itself has no timezone concept, so every entry's
// comment gives the IST clock time and the expression is the UTC equivalent.

const LINK = 'https://i-abhishekkk.github.io/Fitness-app/today'

export const SCHEDULE_MESSAGES = {
  // --- Weekly body check-in — Sunday 9:00 AM ---
  '30 3 * * 0': {
    title: '📏 Weekly Check-in',
    body: "It's Sunday — log this week's weight and body measurements (Progress → Body).",
  },

  // --- Water — 6x/day, every day ---
  '30 1 * * *': { title: '💧 Water #1 of 6', body: 'Start hydrating — first glass of the day.' },
  '0 4 * * *': { title: '💧 Water #2 of 6', body: 'Keep it up — stay ahead of the target.' },
  '30 6 * * *': { title: '💧 Water #3 of 6', body: 'Halfway through the morning — top up.' },
  '0 9 * * *': { title: '💧 Water #4 of 6', body: 'Afternoon check-in — how\'s your intake?' },
  '30 11 * * *': { title: '💧 Water #5 of 6', body: 'Evening push — close the gap before dinner.' },
  '30 14 * * *': { title: '💧 Water #6 of 6', body: 'Last one — hit your daily target before bed.' },

  // --- Supplements ---
  '30 2 * * *': { title: '💊 Collagen', body: 'Take collagen now — 30 min before gym.' },
  '45 2 * * *': { title: '💊 Creatine', body: 'Take creatine now, on your way to the gym.' },
  '30 4 * * *': { title: '💊 Multivitamin + Fish Oil', body: 'Take both right after your post-workout meal.' },
  '30 8 * * *': { title: '💊 Vitamin B12', body: 'Take B12 now, after your afternoon meal.' },
  '0 17 * * *': { title: '💊 Magnesium (ZMA)', body: 'Take magnesium now — 30 min before sleep.' },
  '45 8 * * 0': { title: '💊 Vitamin D3', body: 'Take D3 now, right after Sunday lunch.' },

  // --- Meals — weekday (Mon–Fri: Pull/Push/Leg days share the same times) ---
  '50 0 * * 1-5': { title: '🍽️ Meal 1 — Pre-Workout', body: 'Bananas + soaked dry fruits. Fuel up before skill work.' },
  '15 4 * * 1-5': { title: '🍽️ Meal 2 — Post-Workout', body: 'Anabolic window — eat now, right after the gym.' },
  '0 8 * * 1-5': { title: '🍽️ Meal 3 — Lunch', body: 'Office lunch time — don\'t skip the shake.' },
  '0 14 * * 1-5': { title: '🍽️ Meal 4 — Dinner', body: 'Anchor dinner — the day\'s biggest meal.' },

  // --- Meals — Saturday (HS + Park day) ---
  '0 2 * * 6': { title: '🍽️ Meal 1 — Post-HS Breakfast', body: 'HS session done — eat now.' },
  '30 6 * * 6': { title: '🍽️ Meal 2 — Post-Park Recovery', body: 'Double-session recovery meal — the big one.' },
  '0 9 * * 6': { title: '🍽️ Meal 3 — Afternoon', body: 'Sattu/moong + chicken — shifted Saturday timing.' },
  '0 14 * * 6': { title: '🍽️ Meal 4 — Dinner', body: 'Bulk shake + dinner combined tonight.' },

  // --- Meals — Sunday (Rest day) ---
  '45 3 * * 0': { title: '🍽️ Meal 1 — Relaxed Breakfast', body: 'No rush — bananas + dry fruits.' },
  '0 5 * * 0': { title: '🍽️ Meal 2 — Breakfast', body: 'Standard egg bites + oats, same as training days.' },
  '0 8 * * 0': { title: '🍽️ Meal 3 — Lunch', body: 'Today\'s reduced-carb meal — the day\'s only cut.' },
  '0 15 * * 0': { title: '🍽️ Meal 4 — Dinner', body: 'Anchor dinner — don\'t reduce this one.' },
}

export function messageForSchedule(schedule) {
  const msg = SCHEDULE_MESSAGES[schedule]
  return msg ? { ...msg, link: LINK } : null
}
