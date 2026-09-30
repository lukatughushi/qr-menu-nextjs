// Seeds menu_items with dishes from scripts/menu-seed-data.mjs.
// Images are resolved from TheMealDB / TheCocktailDB by id.
// Usage: node scripts/seed-menu.mjs [--dry-run | --recategorize]
// Idempotent: items whose name_en already exists are skipped.
// --recategorize moves existing seeded rows to the category they are listed under.

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { SEED } from './menu-seed-data.mjs';

const dryRun = process.argv.includes('--dry-run');

for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function imageFor(sourceId) {
  const isDrink = String(sourceId).startsWith('d:');
  const id = String(sourceId).replace('d:', '');
  const url = isDrink
    ? `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`
    : `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
  const res = await fetch(url);
  const json = await res.json();
  const item = isDrink ? json.drinks?.[0] : json.meals?.[0];
  const thumb = isDrink ? item?.strDrinkThumb : item?.strMealThumb;
  if (!thumb) throw new Error(`No image for ${sourceId}`);
  return thumb;
}

const { data: existing, error: exErr } = await supabase.from('menu_items').select('name_en');
if (exErr) throw exErr;

if (process.argv.includes('--recategorize')) {
  let updated = 0;
  for (const [category, items] of Object.entries(SEED)) {
    const names = items.map((it) => it[4]);
    const { data, error } = await supabase
      .from('menu_items').update({ category }).in('name_en', names).neq('category', category).select('id');
    if (error) throw error;
    updated += data.length;
    console.log(`${category}: ${data.length} moved`);
  }
  console.log(`Recategorized ${updated} rows`);
  process.exit(0);
}

const existingNames = new Set(existing.map((r) => r.name_en).filter(Boolean));

const rows = [];
for (const [category, items] of Object.entries(SEED)) {
  for (const [sourceId, price, name, description, name_en, description_en] of items) {
    if (existingNames.has(name_en)) continue;
    const image_url = await imageFor(sourceId);
    rows.push({ name, description, name_en, description_en, price, category, image_url, is_visible: true, discount_percent: 0 });
  }
  console.log(`${category}: ${items.length} items`);
}

console.log(`Prepared ${rows.length} new rows`);
if (dryRun) {
  console.log(JSON.stringify(rows.slice(0, 2), null, 2));
  process.exit(0);
}

for (let i = 0; i < rows.length; i += 50) {
  const { error } = await supabase.from('menu_items').insert(rows.slice(i, i + 50));
  if (error) throw error;
}
console.log(`Inserted ${rows.length} rows`);
