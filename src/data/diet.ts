// Ported from legacy/Abhishek_GodMode_Hub_v7.html, consolidated from 6-7 meals/day to 4
// meals/day (2026-09-18) to fit the 11 AM–5 PM office schedule. Daily macro totals are
// unchanged — meals were merged (pre-workout / post-workout+snack / lunch+shake /
// dinner+bedtime-snack), not re-invented.
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
    intro: { kind: 'tip', text: 'Pull Day (Mon/Thu): 3500 kcal · 172g protein, 4 meals. Meal 2 anabolic window = non-negotiable. Soya at Meal 3, Paneer at Meal 4.' },
    meals: [
      { name: 'Meal 1', time: '6:20 AM', badge: 'ba', headline: 'Pre-Workout — Carbs only, clean gym fuel, no fat lag', kcal: 469,
        ingredients: [
          { item: '2 bananas (200g)', macro: 'P 2g · C 46g · F 0g' },
          { item: '10 almonds + 20 raisins + 2 dates + 1 walnut (soaked from 12 AM)', macro: 'P 5g · C 41g · F 10g' },
        ], totals: 'P 7g · C 87g · F 10g · 469 kcal',
        note: 'Dry fruits soaked overnight — softer, easier to digest pre-workout.' },
      { name: 'Meal 2', time: '9:45 AM · ANABOLIC WINDOW ⚡', badge: 'bg', headline: 'Post-Workout — egg bites, oat shake + sattu/moong, repair starts NOW', kcal: 1060,
        ingredients: [
          { item: '3 whole eggs + 2 egg whites (air-fried 180°C, 8–10 min, no oil)', macro: 'P 26g · C 2g · F 15g' },
          { item: '80g rolled oats + 250ml full-fat milk + 1 mashed banana', macro: 'P 21g · C 89g · F 14g' },
          { item: '1 tsp chia seeds + 1 tsp flax seeds', macro: 'P 2g · C 3g · F 4g' },
          { item: '30g sattu powder in 300ml water + lemon + black salt + jeera', macro: 'P 6g · C 21g · F 1g' },
          { item: '100g sprouted moong (raw weight)', macro: 'P 8g · C 11g · F 0g' },
        ], totals: 'P 63g · C 126g · F 34g · 1060 kcal',
        note: 'Creatine 5g here — always with carbs. This meal switches your body from breakdown to build mode. Eat within 15 min of leaving the gym — you\'re on the clock before the office commute.' },
      { name: 'Meal 3', time: '1:30 PM', badge: 'bb', headline: 'Lunch (office) — Air Fryer Soya Tandoori + rice + dal + curd + bulk shake', kcal: 999,
        ingredients: [
          { item: '100g soya chunks cooked (from ~50g dry — boil, squeeze dry, toss in tandoori masala + 1 tsp oil, air fry 190°C 10 min)', macro: 'P 18g · C 7g · F 1g' },
          { item: '150g cooked rice', macro: 'P 3g · C 38g · F 0g' },
          { item: '100g cooked dal (masoor/toor)', macro: 'P 8g · C 17g · F 1g' },
          { item: '150g full-fat curd', macro: 'P 6g · C 8g · F 5g' },
          { item: '250ml whole milk + 50g rolled oats + 1 banana + 1 tbsp peanut butter (carry as a shake)', macro: 'P 20g · C 72g · F 21g' },
        ], totals: 'P 55g · C 142g · F 28g · 999 kcal',
        note: 'On Chicken days: swap soya for 200g air-fried tandoori chicken breast. Prep the shake in a shaker bottle to carry to the office.' },
      { name: 'Meal 4', time: '7:30 PM', badge: 'br', headline: 'Dinner — Paneer air-fried + dal + rice + rotis + sabzi + warm milk', kcal: 975,
        ingredients: [
          { item: '100g paneer (air fry 180°C 6–8 min)', macro: 'P 19g · C 1g · F 21g' },
          { item: '100g dal dry weight cooked', macro: 'P 9g · C 20g · F 1g' },
          { item: '150g cooked rice', macro: 'P 3g · C 38g · F 0g' },
          { item: '2 rotis (atta, ~30g each)', macro: 'P 5g · C 33g · F 2g' },
          { item: 'Seasonal sabzi (50g)', macro: 'P 1g · C 5g · F 0g' },
          { item: '300ml warm full-fat milk + 6 soaked almonds', macro: 'P 11g · C 16g · F 13g' },
        ], totals: 'P 48g · C 113g · F 37g · 975 kcal',
        note: 'Had chicken at lunch? Use 100g cooked soya chunks here instead. No caffeine after this meal — ZMA 30 min before sleep.' },
    ],
    totalsLabel: 'Pull Day Totals', totalsMacro: 'P 173g · C 468g · F 109g · 3503 kcal',
    totalsBreakdown: 'Meal 1: 469 · Meal 2: 1060 · Meal 3: 999 · Meal 4: 975',
  },
  push: {
    intro: { kind: 'warn', text: 'Push Day (Tue/Fri): 3350 kcal · 171g protein, 4 meals. Same Meal 1–3 as Pull Day. Meal 4 uses air-fried soya chunks. Wrists rest today — no HS.' },
    meals: [
      { name: 'Meal 1', time: '6:20 AM', badge: 'ba', headline: 'Pre-Workout — Carbs only, clean gym fuel, no fat lag', kcal: 469,
        ingredients: [
          { item: '2 bananas (200g)', macro: 'P 2g · C 46g · F 0g' },
          { item: '10 almonds + 20 raisins + 2 dates + 1 walnut (soaked from 12 AM)', macro: 'P 5g · C 41g · F 10g' },
        ], totals: 'P 7g · C 87g · F 10g · 469 kcal',
        note: 'Identical to Pull Day Meal 1.' },
      { name: 'Meal 2', time: '9:45 AM · ANABOLIC WINDOW ⚡', badge: 'bg', headline: 'Post-Workout — egg bites, oat shake + sattu/moong', kcal: 1060,
        ingredients: [
          { item: '3 whole eggs + 2 egg whites (air-fried)', macro: 'P 26g · C 2g · F 15g' },
          { item: '80g rolled oats + 250ml full-fat milk + 1 mashed banana', macro: 'P 21g · C 89g · F 14g' },
          { item: '1 tsp chia + 1 tsp flax seeds', macro: 'P 2g · C 3g · F 4g' },
          { item: '30g sattu powder in 300ml water + lemon + black salt + jeera', macro: 'P 6g · C 21g · F 1g' },
          { item: '100g sprouted moong (raw weight)', macro: 'P 8g · C 11g · F 0g' },
        ], totals: 'P 63g · C 126g · F 34g · 1060 kcal',
        note: 'Push muscles (chest, shoulders, triceps) need the same anabolic window as Pull days. Never skip this meal.' },
      { name: 'Meal 3', time: '1:30 PM', badge: 'bb', headline: 'Lunch (office) — Air Fryer Soya Tandoori + rice + dal + curd + bulk shake', kcal: 999,
        ingredients: [
          { item: '100g soya chunks cooked (tandoori masala, air-fried)', macro: 'P 18g · C 7g · F 1g' },
          { item: '150g cooked rice', macro: 'P 3g · C 38g · F 0g' },
          { item: '100g cooked dal', macro: 'P 8g · C 17g · F 1g' },
          { item: '150g full-fat curd', macro: 'P 6g · C 8g · F 5g' },
          { item: '250ml whole milk + 50g rolled oats + 1 banana + 1 tbsp peanut butter (carry as a shake)', macro: 'P 20g · C 72g · F 21g' },
        ], totals: 'P 55g · C 142g · F 28g · 999 kcal' },
      { name: 'Meal 4', time: '7:30 PM', badge: 'br', headline: 'Dinner — Air-fried Soya Chunks + dal + rice + rotis + sabzi + warm milk', kcal: 806,
        ingredients: [
          { item: '100g cooked soya chunks (air-fried with tandoori masala)', macro: 'P 18g · C 7g · F 1g' },
          { item: '100g dal dry weight cooked', macro: 'P 9g · C 20g · F 1g' },
          { item: '150g cooked rice', macro: 'P 3g · C 38g · F 0g' },
          { item: '2 rotis (atta)', macro: 'P 5g · C 33g · F 2g' },
          { item: 'Seasonal sabzi', macro: 'P 1g · C 5g · F 0g' },
          { item: '300ml warm full-fat milk + 6 soaked almonds', macro: 'P 11g · C 16g · F 13g' },
        ], totals: 'P 47g · C 119g · F 17g · 806 kcal',
        note: 'Had chicken at lunch? Use paneer 100g here instead (full Pull Day Meal 4 structure).' },
    ],
    totalsLabel: 'Push Day Totals', totalsMacro: 'P 172g · C 474g · F 89g · 3334 kcal',
    totalsBreakdown: 'Meal 1: 469 · Meal 2: 1060 · Meal 3: 999 · Meal 4: 806',
  },
  legs: {
    intro: { kind: 'danger', text: 'Leg Day (Wed): 3900 kcal · 201g protein, 4 meals. Heaviest session. Extra date at Meal 1, biggest Meal 2, chicken at Meal 3 with extra rice.' },
    meals: [
      { name: 'Meal 1', time: '6:20 AM', badge: 'ba', headline: 'Pre-Workout — Extra date, maximum glycogen for squats + deadlifts', kcal: 531,
        ingredients: [{ item: '2 bananas + soaked dry fruits + 1 extra khajur (date)', macro: 'P 8g · C 97g · F 10g' }],
        totals: 'P 8g · C 97g · F 10g · 531 kcal',
        note: 'Squats and deadlifts are the most glycogen-expensive movements in the program. Do not skip.' },
      { name: 'Meal 2', time: '9:45 AM · BIGGEST OF THE WEEK ⚡', badge: 'bg', headline: '90g oats + eggs + sattu/moong — legs demand more repair', kcal: 1098,
        ingredients: [
          { item: '3 whole eggs + 2 egg whites (air-fried)', macro: 'P 26g · C 2g · F 15g' },
          { item: '90g rolled oats + 300ml full-fat milk + 1 mashed banana', macro: 'P 23g · C 98g · F 17g' },
          { item: '1 tsp chia + 1 tsp flax seeds', macro: 'P 2g · C 3g · F 4g' },
          { item: '30g sattu in 300ml water + 100g sprouted moong', macro: 'P 14g · C 32g · F 1g' },
        ], totals: 'P 65g · C 135g · F 37g · 1098 kcal',
        note: 'Creatine 5g here. Legs are the body\'s largest muscle group — feed them accordingly.' },
      { name: 'Meal 3', time: '1:30 PM', badge: 'ba', headline: 'Lunch (office) BOOSTED — 200g Air-Fried Tandoori Chicken + extra rice + shake', kcal: 1278,
        ingredients: [
          { item: '200g raw chicken breast (air fry 180°C, 12–14 min, tandoori masala)', macro: 'P 42g · C 0g · F 4g' },
          { item: '200g cooked rice (extra 50g vs normal days)', macro: 'P 4g · C 50g · F 0g' },
          { item: '100g cooked dal + 150g full-fat curd', macro: 'P 13g · C 24g · F 6g' },
          { item: '250ml whole milk + 50g oats + 1 banana + 1 tbsp peanut butter (carry as a shake)', macro: 'P 20g · C 72g · F 21g' },
        ], totals: 'P 79g · C 146g · F 31g · 1278 kcal',
        note: 'Leg day is the only day chicken is mandatory at lunch.' },
      { name: 'Meal 4', time: '7:30 PM', badge: 'br', headline: 'Dinner — Paneer air-fried + dal + rice + rotis + sabzi + warm milk', kcal: 975,
        ingredients: [
          { item: '100g paneer (air-fried) + 100g dal + 150g rice + 2 rotis + sabzi', macro: 'P 37g · C 97g · F 24g' },
          { item: '300ml warm full-fat milk + 6 soaked almonds', macro: 'P 11g · C 16g · F 13g' },
        ], totals: 'P 48g · C 113g · F 37g · 975 kcal' },
    ],
    totalsLabel: 'Leg Day Totals', totalsMacro: 'P 200g · C 491g · F 115g · 3882 kcal',
    totalsBreakdown: 'Meal 1: 531 · Meal 2: 1098 · Meal 3: 1278 · Meal 4: 975',
  },
  sat: {
    intro: { kind: 'succ', text: 'Saturday: Double session day = 3643 kcal · 187g protein, 4 meals. Fasted HS first, then Meal 1. Chicken at Meal 3, Paneer at Meal 4.' },
    meals: [
      { name: 'Meal 1', time: '7:30 AM', badge: 'ba', headline: 'Post-HS Breakfast — Fasted HS session first, eat after', kcal: 469,
        ingredients: [{ item: '2 bananas + soaked dry fruits (10 almonds, 20 raisins, 2 dates, 1 walnut)', macro: 'P 7g · C 87g · F 10g' }],
        totals: 'P 7g · C 87g · F 10g · 469 kcal',
        note: 'Fasted handstand practice = sharper neurological firing.' },
      { name: 'Meal 2', time: '12:00 PM · 4 EGGS TODAY ⚡', badge: 'bg', headline: 'Post-Park Recovery — double session demands extra protein', kcal: 954,
        ingredients: [
          { item: '4 whole eggs (air-fried)', macro: 'P 25g · C 2g · F 20g' },
          { item: '90g rolled oats + 300ml full-fat milk + 1 banana', macro: 'P 23g · C 98g · F 17g' },
          { item: '1 tsp chia + 1 tsp flax seeds', macro: 'P 2g · C 3g · F 4g' },
        ], totals: 'P 50g · C 104g · F 41g · 954 kcal',
        note: 'No creatine at breakfast today — take it with Meal 3 instead.' },
      { name: 'Meal 3', time: '2:30 PM', badge: 'ba', headline: 'Afternoon — Sattu/moong + Tandoori Chicken, shifted timing', kcal: 922,
        ingredients: [
          { item: '30g sattu in 300ml water + 100g sprouted moong', macro: 'P 14g · C 32g · F 1g' },
          { item: '200g raw chicken breast (air-fried tandoori, 180°C 12–14 min)', macro: 'P 42g · C 0g · F 4g' },
          { item: '150g cooked rice + 100g cooked dal + 150g curd', macro: 'P 17g · C 61g · F 7g' },
        ], totals: 'P 73g · C 93g · F 12g · 922 kcal',
        note: 'Creatine 5g here today. Chicken mandatory — heaviest calisthenics day of the week.' },
      { name: 'Meal 4', time: '7:30 PM', badge: 'br', headline: 'Bulk shake + Dinner — Paneer air-fried + dal + rice + rotis + sabzi', kcal: 1298,
        ingredients: [
          { item: '250ml whole milk + 50g oats + 1 banana + 1 tbsp peanut butter', macro: 'P 20g · C 72g · F 21g' },
          { item: '100g paneer (air-fried) + 100g dal + 150g rice + 2 rotis + sabzi', macro: 'P 37g · C 97g · F 24g' },
        ], totals: 'P 57g · C 169g · F 45g · 1298 kcal',
        note: 'Metabolism is running hot from two sessions — eat the full meal.' },
    ],
    totalsLabel: 'Saturday Totals', totalsMacro: 'P 187g · C 453g · F 108g · 3643 kcal',
    totalsBreakdown: 'Meal 1: 469 · Meal 2: 954 · Meal 3: 922 · Meal 4: 1298',
  },
  rest: {
    intro: { kind: 'tip', text: 'Sunday (Rest): 2822 kcal · 147g protein, 4 meals. No office, no gym. Wake naturally. Protein synthesis still runs 36–48 hrs post-Saturday.' },
    meals: [
      { name: 'Meal 1', time: '9:15 AM', badge: 'ba', headline: 'Late Breakfast — same bananas + dry fruits, no rush', kcal: 469,
        ingredients: [{ item: '2 bananas + soaked dry fruits', macro: 'P 7g · C 87g · F 10g' }],
        totals: 'P 7g · C 87g · F 10g · 469 kcal' },
      { name: 'Meal 2', time: '10:30 AM', badge: 'bg', headline: 'Standard — egg bites + oats, same as training days', kcal: 866,
        ingredients: [{ item: '3 whole eggs + 2 egg whites (air-fried) + 80g oats + 250ml milk + banana + seeds', macro: 'P 49g · C 95g · F 33g' }],
        totals: 'P 49g · C 95g · F 33g · 866 kcal',
        note: 'No creatine today — rest day. Protein synthesis continues through Sunday from Saturday\'s two sessions.' },
      { name: 'Meal 3', time: '1:30 PM', badge: 'bb', headline: 'Reduced Lunch — Sattu/moong + soya, small portion (the day\'s carb cut)', kcal: 512,
        ingredients: [
          { item: '30g sattu in 300ml water + 100g sprouted moong', macro: 'P 14g · C 32g · F 1g' },
          { item: '100g cooked soya chunks (air-fried or plain)', macro: 'P 18g · C 7g · F 1g' },
          { item: '100g cooked rice (reduced from 150g)', macro: 'P 2g · C 25g · F 0g' },
          { item: '75g cooked dal + 100g full-fat curd', macro: 'P 10g · C 17g · F 4g' },
        ], totals: 'P 44g · C 81g · F 6g · 512 kcal',
        note: 'The entire calorie reduction on rest day comes from this one meal — just 50g less rice and smaller curd.' },
      { name: 'Meal 4', time: '8:30 PM', badge: 'br', headline: 'Anchor Dinner — Paneer or soya air-fried + dal + rice + rotis + sabzi + warm milk', kcal: 975,
        ingredients: [
          { item: '100g paneer air-fried + 100g dal + 150g rice + 2 rotis + sabzi', macro: 'P 37g · C 97g · F 24g' },
          { item: '300ml warm full-fat milk + 6 soaked almonds', macro: 'P 11g · C 16g · F 13g' },
        ], totals: 'P 48g · C 113g · F 37g · 975 kcal',
        note: 'Don\'t reduce dinner. Muscles are still building Sunday night — feed them.' },
    ],
    totalsLabel: 'Rest Day Totals', totalsMacro: 'P 148g · C 376g · F 86g · 2822 kcal',
    totalsBreakdown: 'Meal 1: 469 · Meal 2: 866 · Meal 3: 512 · Meal 4: 975',
  },
}

export const QUICK_ADD = [
  { name: 'Meal 1 Pre-workout', p: 7, c: 87, f: 10, k: 469 },
  { name: 'Meal 2 Post-workout', p: 63, c: 126, f: 34, k: 1060 },
  { name: 'Meal 2 Legs (bigger)', p: 65, c: 135, f: 37, k: 1098 },
  { name: 'Meal 3 Soya Lunch', p: 55, c: 142, f: 28, k: 999 },
  { name: 'Meal 3 Chicken Lunch (Legs)', p: 79, c: 146, f: 31, k: 1278 },
  { name: 'Meal 4 Paneer Dinner', p: 48, c: 113, f: 37, k: 975 },
  { name: 'Meal 4 Soya Dinner', p: 47, c: 119, f: 17, k: 806 },
]

export const BADGE_COLORS: Record<Meal['badge'], { color: string; dim: string }> = {
  ba: { color: 'var(--color-amber)', dim: 'var(--color-amber-dim)' },
  bg: { color: 'var(--color-green)', dim: 'var(--color-green-dim)' },
  bb: { color: 'var(--color-blue)', dim: 'var(--color-blue-dim)' },
  br: { color: 'var(--color-accent)', dim: 'var(--color-accent-dim)' },
  bp: { color: 'var(--color-purple)', dim: 'var(--color-purple-dim)' },
}
