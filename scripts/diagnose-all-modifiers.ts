/**
 * Diagnostic: scan modifiers across ALL orders to determine whether the
 * missing cloverModId problem is systemic (cross-reference gap) or sporadic
 * (stale cart / load race). Read-only.
 *
 * For every order_items modifier we report:
 *  - null vs present cloverModId, by category, over time
 *  - per-order "all null" vs "partial null" vs "clean" signature
 *  - whether a saved (non-null) cloverModId still MATCHES what current
 *    production mappings + itemModifierGroupMapping would resolve (drift)
 *  - whether a null modifier COULD be resolved today (i.e. the fix is viable)
 *
 * Run: npx tsx scripts/diagnose-all-modifiers.ts
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const read = (f: string) => JSON.parse(readFileSync(join(process.cwd(), 'src', 'data', f), 'utf-8'));
const menu = read('menu-data.json');
const prod = read('clover-mappings-production.json');
const mapping: Record<string, Record<string, string>> = menu.itemModifierGroupMapping || {};

// menu item name -> menu item id
const itemIdByName: Record<string, string> = {};
for (const it of menu.items) itemIdByName[it.name] = it.id;

// category (as stored on the modifier) -> website group id
const CATEGORY_TO_GROUP: Record<string, string> = {
  meat: 'meat-selection',
  side: 'side-selection',
  condiment: 'condiments',
  topping: 'add-on-toppings',
};

// Resolve what cloverModId SHOULD be today, given item name + category + mod name.
function resolveNow(itemName: string, category: string, modName: string): string | undefined {
  const itemId = itemIdByName[itemName];
  const baseGroup = CATEGORY_TO_GROUP[(category || '').toLowerCase()];
  let groupId = baseGroup;
  if (itemId && baseGroup && mapping[itemId]?.[baseGroup]) groupId = mapping[itemId][baseGroup];
  for (const g of menu.modifierGroups) {
    if (groupId && g.id !== groupId) continue;
    const mod = g.modifiers.find((m: { name: string }) => m.name.toLowerCase() === modName.toLowerCase());
    if (mod) {
      const cid = prod.modifiers[mod.id];
      if (cid) return cid;
    }
  }
  // fall back: search ALL groups by name (ambiguous, but tells us if name is unknown entirely)
  for (const g of menu.modifierGroups) {
    const mod = g.modifiers.find((m: { name: string }) => m.name.toLowerCase() === modName.toLowerCase());
    if (mod && prod.modifiers[mod.id]) return prod.modifiers[mod.id];
  }
  return undefined;
}

interface Mod { name?: string; category?: string | null; cloverModId?: string | null }

async function main() {
  // page through all order_items
  const all: { order_id: string; item_name: string; modifiers: Mod[] | null; created_at: string }[] = [];
  let from = 0;
  const page = 1000;
  for (;;) {
    const { data, error } = await supabase
      .from('order_items')
      .select('order_id, item_name, modifiers, created_at')
      .order('created_at', { ascending: true })
      .range(from, from + page - 1);
    if (error) { console.error(error.message); process.exit(1); }
    if (!data || data.length === 0) break;
    all.push(...(data as typeof all));
    if (data.length < page) break;
    from += page;
  }

  console.log(`Scanned ${all.length} order_items.\n`);

  let totalMods = 0, nullMods = 0;
  const byCat: Record<string, { total: number; nul: number }> = {};
  const unknownNames = new Map<string, number>();          // modifier name not in any menu group
  const resolvableNulls = new Map<string, number>();        // null today but resolvable -> fix works
  const unresolvableNulls = new Map<string, number>();      // null and NOT resolvable -> real gap
  const drift = new Map<string, number>();                  // saved id != current resolved id
  let driftCount = 0;

  // per-item-line signature
  let cleanItems = 0, allNullItems = 0, partialItems = 0, noModItems = 0;
  // per-month null rate
  const byMonth: Record<string, { total: number; nul: number }> = {};

  for (const it of all) {
    const mods = (it.modifiers || []).filter((m) => {
      const c = (m.category || '').toLowerCase();
      return ['meat', 'side', 'condiment', 'topping'].includes(c);
    });
    if (mods.length === 0) { noModItems++; continue; }
    const month = it.created_at.slice(0, 7);
    byMonth[month] = byMonth[month] || { total: 0, nul: 0 };

    let n = 0;
    for (const m of mods) {
      totalMods++;
      byMonth[month].total++;
      const cat = (m.category || '?').toLowerCase();
      byCat[cat] = byCat[cat] || { total: 0, nul: 0 };
      byCat[cat].total++;

      const shouldBe = resolveNow(it.item_name, m.category || '', m.name || '');

      if (!m.cloverModId) {
        nullMods++; n++;
        byCat[cat].nul++;
        byMonth[month].nul++;
        const key = `${it.item_name} | ${cat}:${m.name}`;
        if (shouldBe) resolvableNulls.set(key, (resolvableNulls.get(key) || 0) + 1);
        else {
          unresolvableNulls.set(key, (unresolvableNulls.get(key) || 0) + 1);
          if (!shouldBe) unknownNames.set(`${cat}:${m.name}`, (unknownNames.get(`${cat}:${m.name}`) || 0) + 1);
        }
      } else if (shouldBe && shouldBe !== m.cloverModId) {
        driftCount++;
        const key = `${it.item_name} | ${cat}:${m.name}  saved=${m.cloverModId} now=${shouldBe}`;
        drift.set(key, (drift.get(key) || 0) + 1);
      }
    }
    if (n === 0) cleanItems++;
    else if (n === mods.length) allNullItems++;
    else partialItems++;
  }

  console.log('=== Overall ===');
  console.log(`catalog modifiers (meat/side/condiment/topping): ${totalMods}`);
  console.log(`  null cloverModId: ${nullMods} (${((nullMods / totalMods) * 100).toFixed(1)}%)`);
  console.log(`  drift (saved id != current resolved id): ${driftCount}`);

  console.log('\n=== By category ===');
  for (const [c, s] of Object.entries(byCat)) console.log(`  ${c.padEnd(10)} ${s.nul}/${s.total} null`);

  console.log('\n=== Per line-item signature ===');
  console.log(`  clean (0 null):    ${cleanItems}`);
  console.log(`  ALL null:          ${allNullItems}   <- empty-catalog (race / stale cart)`);
  console.log(`  PARTIAL null:      ${partialItems}   <- name/group mismatch signature`);
  console.log(`  no catalog mods:   ${noModItems}`);

  console.log('\n=== Null rate by month ===');
  for (const [m, s] of Object.entries(byMonth).sort()) {
    console.log(`  ${m}  ${String(s.nul).padStart(4)}/${String(s.total).padStart(4)} null  (${((s.nul / s.total) * 100).toFixed(0)}%)`);
  }

  console.log('\n=== Nulls that WOULD resolve today (fix is viable) — top 20 ===');
  for (const [k, n] of [...resolvableNulls.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) console.log(`  x${n}  ${k}`);

  console.log('\n=== Nulls that would STILL NOT resolve (true cross-ref gap) — top 20 ===');
  const ur = [...unresolvableNulls.entries()].sort((a, b) => b[1] - a[1]);
  if (ur.length === 0) console.log('  (none — every null is resolvable with current mappings)');
  for (const [k, n] of ur.slice(0, 20)) console.log(`  x${n}  ${k}`);

  console.log('\n=== Modifier names unknown to the menu catalog entirely — top 20 ===');
  const un = [...unknownNames.entries()].sort((a, b) => b[1] - a[1]);
  if (un.length === 0) console.log('  (none)');
  for (const [k, n] of un.slice(0, 20)) console.log(`  x${n}  ${k}`);

  console.log('\n=== Drift: saved cloverModId != current resolved — top 20 ===');
  const dr = [...drift.entries()].sort((a, b) => b[1] - a[1]);
  if (dr.length === 0) console.log('  (none — every saved id matches current mappings)');
  for (const [k, n] of dr.slice(0, 20)) console.log(`  x${n}  ${k}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
