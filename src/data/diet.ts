// Ported 1:1 from legacy/Abhishek_GodMode_Hub_v7.html (Diet → Full Plan)
import type { DayType } from './plan'

export interface Ingredient {
  item: string
  macro: string // e.g. "P 2g · C 46g · F 0g"
}
export interface Meal {
  name: string
  time: string
  badge: 'ba' | 'bg' | 'bb' | 'br' | 'bp' // amber / green / blue / red / purple
  tagline?: string
  headline: string
  kcal: number
  ingredients: Ingredient[]
  totals: string // "P 7g · C 87g · F 10g · 469 kcal"
  note?: string
  skipped?: boolean
}

export interface DietPlan {
  intro: { kind: 'succ' | 'warn' | 'danger' | 'tip'; text: string }
  meals: Meal[]
  totalsLabel: string
  totalsMacro: string
  totalsBreakdown: string
}

export const DIET_PLANS: Record<DayType, DietPlan> = {
  pull: {
    intro: { kind: 'tip', text: 'Pull Day (Mon/Thu): 3500 kcal · 172g protein. M2 anabolic window = non-negotiable. Soya at M4, Paneer at M6.' },
    meals: [
      { name: 'M1', time: '6:20 AM', badge: 'ba', headline: 'Pre-Workout — Carbs only, clean gym fuel, no fat lag', kcal: 469,
        ingredients: [
          { item: '2 bananas (200g)', macro: 'P 2g · C 46g · F 0g' },
          { item: '10 almonds + 20 raisins + 2 dates + 1 walnut (soaked from 12 AM)', macro: 'P 5g · C 41g · F 10g' },
        ], totals: 'P 7g · C 87g · F 10g · 469 kcal',
        note: 'Dry fruits soaked overnight — softer, easier to digest pre-workout.' },
      { name: 'M2', time: '8:30 AM · ANABOLIC WINDOW ⚡', badge: 'bg', headline: 'Post-Workout — Air-fried egg bites + oat shake, repair starts NOW', kcal: 866,
        ingredients: [
          { item: '3 whole eggs + 2 egg whites (air-fried 180°C, 8–10 min, no oil)', macro: 'P 26g · C 2g · F 15g' },
          { item: '80g rolled oats + 250ml full-fat milk + 1 mashed banana', macro: 'P 21g · C 89g · F 14g' },
          { item: '1 tsp chia seeds + 1 tsp flax seeds', macro: 'P 2g · C 3g · F 4g' },
        ], totals: 'P 49g · C 95g · F 33g · 866 kcal',
        note: 'Creatine 5g here — always with carbs. This single meal switches your body from breakdown to build mode.' },
      { name: 'M3', time: '11:30 AM', badge: 'bb', headline: 'Mid-Morning — Sattu drink + sprouted moong, gut fuel + slow protein', kcal: 194,
        ingredients: [
          { item: '30g sattu powder in 300ml water + lemon + black salt + jeera', macro: 'P 6g · C 21g · F 1g' },
          { item: '100g sprouted moong (raw weight)', macro: 'P 8g · C 11g · F 0g' },
        ], totals: 'P 14g · C 32g · F 1g · 194 kcal',
        note: 'Sattu = roasted chickpea flour, slow-digesting, gut-friendly.' },
      { name: 'M4', time: '2:00 PM', badge: 'bb', headline: 'Lunch — Air Fryer Soya Tandoori + Rice + Dal + Curd', kcal: 449,
        ingredients: [
          { item: '100g soya chunks cooked (from ~50g dry — boil, squeeze dry, toss in tandoori masala + 1 tsp oil, air fry 190°C 10 min)', macro: 'P 18g · C 7g · F 1g' },
          { item: '150g cooked rice', macro: 'P 3g · C 38g · F 0g' },
          { item: '100g cooked dal (masoor/toor)', macro: 'P 8g · C 17g · F 1g' },
          { item: '150g full-fat curd', macro: 'P 6g · C 8g · F 5g' },
        ], totals: 'P 34g · C 61g · F 7g · 449 kcal',
        note: 'On Chicken days: swap soya for 200g air-fried tandoori chicken breast (+9g protein, +178 kcal).' },
      { name: 'M5', time: '5:30 PM', badge: 'ba', headline: 'High-Cal Shake — liquid calories, no chewing required', kcal: 550,
        ingredients: [
          { item: '250ml whole milk', macro: 'P 8g · C 12g · F 9g' },
          { item: '50g rolled oats (blend or soak 30 min)', macro: 'P 7g · C 34g · F 4g' },
          { item: '1 big banana (120g)', macro: 'P 1g · C 23g · F 0g' },
          { item: '1 tbsp creamy peanut butter (16g)', macro: 'P 4g · C 3g · F 9g' },
        ], totals: 'P 20g · C 72g · F 21g · 550 kcal' },
      { name: 'M6', time: '8:00 PM', badge: 'br', headline: 'Anchor Dinner — Paneer air-fried + dal + rice + rotis + sabzi', kcal: 748,
        ingredients: [
          { item: '100g paneer (air fry 180°C 6–8 min)', macro: 'P 19g · C 1g · F 21g' },
          { item: '100g dal dry weight cooked', macro: 'P 9g · C 20g · F 1g' },
          { item: '150g cooked rice', macro: 'P 3g · C 38g · F 0g' },
          { item: '2 rotis (atta, ~30g each)', macro: 'P 5g · C 33g · F 2g' },
          { item: 'Seasonal sabzi (50g)', macro: 'P 1g · C 5g · F 0g' },
        ], totals: 'P 37g · C 97g · F 24g · 748 kcal',
        note: 'Had chicken at lunch? Use 100g cooked soya chunks here instead.' },
      { name: 'Snack', time: '9:30 PM', badge: 'bp', headline: 'Warm milk + soaked almonds — sleep primer', kcal: 227,
        ingredients: [
          { item: '300ml warm full-fat milk', macro: 'P 10g · C 14g · F 10g' },
          { item: '6 soaked almonds', macro: 'P 2g · C 2g · F 3g' },
        ], totals: 'P 11g · C 16g · F 13g · 227 kcal',
        note: 'No caffeine after 8 PM. ZMA 30 min before this.' },
    ],
    totalsLabel: 'Pull Day Totals', totalsMacro: 'P 172g · C 460g · F 109g · 3503 kcal',
    totalsBreakdown: 'M1 469 · M2 866 · M3 194 · M4 449 · M5 550 · M6 748 · Snack 227',
  },
  push: {
    intro: { kind: 'warn', text: 'Push Day (Tue/Fri): 3350 kcal · 171g protein. Same M1–M5 as Pull Day. M6 uses air-fried soya chunks. Wrists rest today — no HS.' },
    meals: [
      { name: 'M1–M5', time: '', badge: 'bb', headline: 'Identical to Pull Day', kcal: 2529,
        ingredients: [
          { item: 'M1 bananas + dry fruits', macro: '469 kcal' },
          { item: 'M2 air-fried eggs + oat shake', macro: '866 kcal' },
          { item: 'M3 sattu + moong', macro: '194 kcal' },
          { item: 'M4 air fryer soya tandoori + rice + dal + curd', macro: '449 kcal' },
          { item: 'M5 bulk shake with PB', macro: '550 kcal' },
        ], totals: 'See Pull Day for full breakdown',
        note: 'Push muscles (chest, shoulders, triceps) are large groups — they require the same anabolic window as Pull days. Never skip M2.' },
      { name: 'M6', time: '8:00 PM', badge: 'br', headline: 'Anchor Dinner — Air-fried Soya Chunks + dal + rice + rotis + sabzi', kcal: 579,
        ingredients: [
          { item: '100g cooked soya chunks (air-fried with tandoori masala)', macro: 'P 18g · C 7g · F 1g' },
          { item: '100g dal dry weight cooked', macro: 'P 9g · C 20g · F 1g' },
          { item: '150g cooked rice', macro: 'P 3g · C 38g · F 0g' },
          { item: '2 rotis (atta)', macro: 'P 5g · C 33g · F 2g' },
          { item: 'Seasonal sabzi', macro: 'P 1g · C 5g · F 0g' },
        ], totals: 'P 36g · C 101g · F 3g · 579 kcal',
        note: 'Had chicken at M4? Use paneer 100g here instead (full Pull Day M6 structure).' },
      { name: 'Snack', time: '9:30 PM', badge: 'bp', headline: 'Warm milk + soaked almonds', kcal: 227,
        ingredients: [{ item: '300ml warm full-fat milk + 6 soaked almonds', macro: 'P 11g · C 16g · F 13g' }],
        totals: 'P 11g · C 16g · F 13g · 227 kcal' },
    ],
    totalsLabel: 'Push Day Totals', totalsMacro: 'P 171g · C 464g · F 91g · 3334 kcal',
    totalsBreakdown: 'M1 469 · M2 866 · M3 194 · M4 449 · M5 550 · M6 579 · Snack 227',
  },
  legs: {
    intro: { kind: 'danger', text: 'Leg Day (Wed): 3900 kcal · 201g protein. Heaviest session. Extra date at M1, bigger M2, chicken at M4 with extra rice.' },
    meals: [
      { name: 'M1', time: '6:20 AM', badge: 'ba', headline: 'Pre-Workout — Extra date, maximum glycogen for squats + deadlifts', kcal: 531,
        ingredients: [{ item: '2 bananas + soaked dry fruits + 1 extra khajur (date)', macro: 'P 8g · C 97g · F 10g' }],
        totals: 'P 8g · C 97g · F 10g · 531 kcal',
        note: 'Squats and deadlifts are the most glycogen-expensive movements in the program. Do not skip.' },
      { name: 'M2', time: '8:30 AM · BIGGEST M2 OF THE WEEK ⚡', badge: 'bg', headline: '90g oats + 300ml milk — legs demand more repair', kcal: 904,
        ingredients: [
          { item: '3 whole eggs + 2 egg whites (air-fried)', macro: 'P 26g · C 2g · F 15g' },
          { item: '90g rolled oats + 300ml full-fat milk + 1 mashed banana', macro: 'P 23g · C 98g · F 17g' },
          { item: '1 tsp chia + 1 tsp flax seeds', macro: 'P 2g · C 3g · F 4g' },
        ], totals: 'P 52g · C 104g · F 36g · 904 kcal',
        note: 'Creatine 5g here. Legs are the body\'s largest muscle group — feed them accordingly.' },
      { name: 'M3', time: '11:30 AM', badge: 'bb', headline: 'Sattu + moong — same as always', kcal: 194,
        ingredients: [{ item: '30g sattu in 300ml water + 100g sprouted moong', macro: 'P 14g · C 32g · F 1g' }],
        totals: 'P 14g · C 32g · F 1g · 194 kcal' },
      { name: 'M4', time: '2:00 PM', badge: 'ba', headline: 'Lunch BOOSTED — 200g Air-Fried Tandoori Chicken + extra rice', kcal: 728,
        ingredients: [
          { item: '200g raw chicken breast (air fry 180°C, 12–14 min, tandoori masala)', macro: 'P 42g · C 0g · F 4g' },
          { item: '200g cooked rice (extra 50g vs normal days)', macro: 'P 4g · C 50g · F 0g' },
          { item: '100g cooked dal + 150g full-fat curd', macro: 'P 13g · C 24g · F 6g' },
        ], totals: 'P 59g · C 74g · F 11g · 728 kcal',
        note: 'Leg day is the only day chicken is mandatory at M4.' },
      { name: 'M5', time: '5:30 PM', badge: 'ba', headline: 'Full shake with PB — calorie surplus locked in', kcal: 550,
        ingredients: [{ item: '250ml whole milk + 50g oats + 1 banana + 1 tbsp peanut butter', macro: 'P 20g · C 72g · F 21g' }],
        totals: 'P 20g · C 72g · F 21g · 550 kcal' },
      { name: 'M6', time: '8:00 PM', badge: 'br', headline: 'Anchor Dinner — Paneer air-fried + dal + rice + rotis + sabzi', kcal: 748,
        ingredients: [{ item: '100g paneer (air-fried) + 100g dal + 150g rice + 2 rotis + sabzi', macro: 'P 37g · C 97g · F 24g' }],
        totals: 'P 37g · C 97g · F 24g · 748 kcal' },
      { name: 'Snack', time: '9:30 PM', badge: 'bp', headline: 'Warm milk + soaked almonds', kcal: 227,
        ingredients: [{ item: '300ml warm full-fat milk + 6 soaked almonds', macro: 'P 11g · C 16g · F 13g' }],
        totals: 'P 11g · C 16g · F 13g · 227 kcal' },
    ],
    totalsLabel: 'Leg Day Totals', totalsMacro: 'P 201g · C 492g · F 116g · 3882 kcal',
    totalsBreakdown: 'M1 531 · M2 904 · M3 194 · M4 728 · M5 550 · M6 748 · Snack 227',
  },
  sat: {
    intro: { kind: 'succ', text: 'Saturday: Double session day = 3591 kcal · 173g protein. Fasted HS first, then M1. All meal times shift ~3 hrs. Chicken at M4, Paneer at M6.' },
    meals: [
      { name: 'M1', time: '7:30 AM', badge: 'ba', headline: 'Post-HS Breakfast — Fasted HS session first, eat after', kcal: 469,
        ingredients: [{ item: '2 bananas + soaked dry fruits (10 almonds, 20 raisins, 2 dates, 1 walnut)', macro: 'P 7g · C 87g · F 10g' }],
        totals: 'P 7g · C 87g · F 10g · 469 kcal',
        note: 'Fasted handstand practice = sharper neurological firing.' },
      { name: 'M2', time: '12:00 PM · 4 EGGS TODAY ⚡', badge: 'bg', headline: 'Post-Park Recovery — double session demands extra protein', kcal: 954,
        ingredients: [
          { item: '4 whole eggs (air-fried)', macro: 'P 25g · C 2g · F 20g' },
          { item: '90g rolled oats + 300ml full-fat milk + 1 banana', macro: 'P 23g · C 98g · F 17g' },
          { item: '1 tsp chia + 1 tsp flax seeds', macro: 'P 2g · C 3g · F 4g' },
        ], totals: 'P 50g · C 104g · F 41g · 954 kcal',
        note: 'No creatine on Saturday morning — take it with M4 or M5 instead.' },
      { name: 'M3', time: '2:30 PM', badge: 'bb', headline: 'Mid-Afternoon — Sattu + moong, shifted timing', kcal: 194,
        ingredients: [{ item: '30g sattu in 300ml water + 100g sprouted moong', macro: 'P 14g · C 32g · F 1g' }],
        totals: 'P 14g · C 32g · F 1g · 194 kcal' },
      { name: 'M4', time: '5:00 PM', badge: 'ba', headline: 'Lunch — 200g Air-Fried Tandoori Chicken + rice + dal + curd', kcal: 728,
        ingredients: [
          { item: '200g raw chicken breast (air-fried tandoori, 180°C 12–14 min)', macro: 'P 42g · C 0g · F 4g' },
          { item: '150g cooked rice + 100g cooked dal + 150g curd', macro: 'P 17g · C 61g · F 7g' },
        ], totals: 'P 59g · C 74g · F 11g · 728 kcal',
        note: 'Creatine 5g here today (not at M2). Chicken mandatory — heaviest calisthenics day of the week.' },
      { name: 'M5', time: '8:00 PM', badge: 'ba', headline: 'Full shake with PB — shifted to evening', kcal: 550,
        ingredients: [{ item: '250ml whole milk + 50g oats + 1 banana + 1 tbsp peanut butter', macro: 'P 20g · C 72g · F 21g' }],
        totals: 'P 20g · C 72g · F 21g · 550 kcal' },
      { name: 'M6', time: '9:30 PM', badge: 'br', headline: 'Light Dinner — Paneer air-fried + dal + rice + rotis + sabzi', kcal: 748,
        ingredients: [{ item: '100g paneer (air-fried) + 100g dal + 150g rice + 2 rotis + sabzi', macro: 'P 37g · C 97g · F 24g' }],
        totals: 'P 37g · C 97g · F 24g · 748 kcal',
        note: 'Late dinner on Saturday is fine — metabolism is running hot from two sessions.' },
    ],
    totalsLabel: 'Saturday Totals', totalsMacro: 'P 187g · C 466g · F 108g · 3643 kcal',
    totalsBreakdown: 'M1 469 · M2 954 · M3 194 · M4 728 · M5 550 · M6 748 · (no stream snack — late M6)',
  },
  rest: {
    intro: { kind: 'tip', text: 'Sunday (Rest): 2653 kcal · 146g protein. No M5 shake. Reduced M4 portions. Wake naturally. Protein synthesis still runs 36–48 hrs post-Saturday.' },
    meals: [
      { name: 'M1', time: '9:15 AM', badge: 'ba', headline: 'Late Breakfast — same bananas + dry fruits, no rush', kcal: 469,
        ingredients: [{ item: '2 bananas + soaked dry fruits', macro: 'P 7g · C 87g · F 10g' }],
        totals: 'P 7g · C 87g · F 10g · 469 kcal' },
      { name: 'M2', time: '10:30 AM', badge: 'bg', headline: 'Standard — egg bites + oats, same as training days', kcal: 866,
        ingredients: [{ item: '3 whole eggs + 2 egg whites (air-fried) + 80g oats + 250ml milk + banana + seeds', macro: 'P 49g · C 95g · F 33g' }],
        totals: 'P 49g · C 95g · F 33g · 866 kcal',
        note: 'No creatine today — rest day. Protein synthesis continues through Sunday from Saturday\'s two sessions.' },
      { name: 'M3', time: '1:30 PM', badge: 'bb', headline: 'Mid-Day — Sattu + moong', kcal: 194,
        ingredients: [{ item: '30g sattu in 300ml water + 100g sprouted moong', macro: 'P 14g · C 32g · F 1g' }],
        totals: 'P 14g · C 32g · F 1g · 194 kcal' },
      { name: 'M4', time: '3:30 PM', badge: 'bb', headline: 'Reduced Lunch — Soya + reduced rice + dal + curd (carb cut here only)', kcal: 318,
        ingredients: [
          { item: '100g cooked soya chunks (air-fried or plain)', macro: 'P 18g · C 7g · F 1g' },
          { item: '100g cooked rice (reduced from 150g)', macro: 'P 2g · C 25g · F 0g' },
          { item: '75g cooked dal + 100g full-fat curd', macro: 'P 10g · C 17g · F 4g' },
        ], totals: 'P 29g · C 49g · F 5g · 318 kcal',
        note: 'The entire calorie reduction on rest day comes from this one meal — just 50g less rice and smaller curd.' },
      { name: 'M5', time: '', badge: 'bb', headline: 'Skipped on Sundays', kcal: 0, ingredients: [], totals: '', skipped: true,
        note: 'No shake on rest day. This is where the ~550 kcal difference from training days comes from.' },
      { name: 'M6', time: '8:30 PM', badge: 'br', headline: 'Anchor Dinner — Paneer or soya air-fried + dal + rice + rotis + sabzi', kcal: 748,
        ingredients: [{ item: '100g paneer air-fried + 100g dal + 150g rice + 2 rotis + sabzi', macro: 'P 37g · C 97g · F 24g' }],
        totals: 'P 37g · C 97g · F 24g · 748 kcal',
        note: 'Don\'t reduce dinner. Muscles are still building Sunday night — feed them.' },
      { name: 'Snack', time: '9:30 PM', badge: 'bp', headline: 'Warm milk + almonds', kcal: 227,
        ingredients: [{ item: '300ml warm full-fat milk + 6 soaked almonds', macro: 'P 11g · C 16g · F 13g' }],
        totals: 'P 11g · C 16g · F 13g · 227 kcal' },
    ],
    totalsLabel: 'Rest Day Totals', totalsMacro: 'P 147g · C 375g · F 86g · 2822 kcal',
    totalsBreakdown: 'M1 469 · M2 866 · M3 194 · M4 318 · M5 0 · M6 748 · Snack 227',
  },
}

export const QUICK_ADD = [
  { name: 'M1 Pre-workout', p: 7, c: 87, f: 10, k: 469 },
  { name: 'M2 Post-workout', p: 49, c: 95, f: 33, k: 866 },
  { name: 'M2 Legs/Sat (bigger)', p: 52, c: 104, f: 36, k: 904 },
  { name: 'M3 Mid-morning', p: 14, c: 32, f: 1, k: 194 },
  { name: 'M4 Soya (Pull/Push/Rest)', p: 34, c: 61, f: 7, k: 449 },
  { name: 'M4 Chicken (Legs/Sat)', p: 59, c: 74, f: 11, k: 728 },
  { name: 'M5 Bulk Shake', p: 20, c: 72, f: 21, k: 550 },
  { name: 'M6 Paneer Dinner', p: 37, c: 97, f: 24, k: 748 },
  { name: 'M6 Soya Dinner', p: 36, c: 101, f: 3, k: 579 },
  { name: 'Stream Snack', p: 11, c: 16, f: 13, k: 227 },
]

export const BADGE_COLORS: Record<Meal['badge'], { color: string; dim: string }> = {
  ba: { color: 'var(--color-amber)', dim: 'var(--color-amber-dim)' },
  bg: { color: 'var(--color-green)', dim: 'var(--color-green-dim)' },
  bb: { color: 'var(--color-blue)', dim: 'var(--color-blue-dim)' },
  br: { color: 'var(--color-accent)', dim: 'var(--color-accent-dim)' },
  bp: { color: 'var(--color-purple)', dim: 'var(--color-purple-dim)' },
}
