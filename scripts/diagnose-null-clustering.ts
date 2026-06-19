/**
 * Diagnostic: do null cloverModIds cluster by ORDER and by DATE?
 *  - If whole orders are all-null/all-clean -> per-session catalog-load failure.
 *  - If specific dates spike -> deploy gap / incident windows.
 *  - Also: does drift (stale saved id) line up with date? -> catalog re-export date.
 * Read-only. Run: npx tsx scripts/diagnose-null-clustering.ts
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
const itemIdByName: Record<string, string> = {};
for (const it of menu.items) itemIdByName[it.name] = it.id;
const CAT: Record<string, string> = { meat: 'meat-selection', side: 'side-selection', condiment: 'condiments', topping: 'add-on-toppings' };
function resolveNow(itemName: string, category: string, modName: string): string | undefined {
  const itemId = itemIdByName[itemName];
  const base = CAT[(category || '').toLowerCase()];
  let g = base;
  if (itemId && base && mapping[itemId]?.[base]) g = mapping[itemId][base];
  for (const grp of menu.modifierGroups) {
    if (g && grp.id !== g) continue;
    const m = grp.modifiers.find((x: { name: string }) => x.name.toLowerCase() === modName.toLowerCase());
    if (m && prod.modifiers[m.id]) return prod.modifiers[m.id];
  }
  return undefined;
}

interface Mod { name?: string; category?: string | null; cloverModId?: string | null }

async function main() {
  // pull order_items joined with order created_at/number
  const items: { order_id: string; item_name: string; modifiers: Mod[] | null }[] = [];
  let from = 0;
  for (;;) {
    const { data } = await supabase.from('order_items').select('order_id, item_name, modifiers').range(from, from + 999);
    if (!data || data.length === 0) break;
    items.push(...(data as typeof items));
    if (data.length < 1000) break;
    from += 1000;
  }
  const { data: orders } = await supabase.from('orders').select('id, order_number, created_at, clover_order_id');
  const ordById = new Map((orders || []).map((o) => [o.id, o]));

  // per order: counts
  const perOrder = new Map<string, { tot: number; nul: number; drift: number }>();
  for (const it of items) {
    const mods = (it.modifiers || []).filter((m) => ['meat', 'side', 'condiment', 'topping'].includes((m.category || '').toLowerCase()));
    if (!mods.length) continue;
    const rec = perOrder.get(it.order_id) || { tot: 0, nul: 0, drift: 0 };
    for (const m of mods) {
      rec.tot++;
      const now = resolveNow(it.item_name, m.category || '', m.name || '');
      if (!m.cloverModId) rec.nul++;
      else if (now && now !== m.cloverModId) rec.drift++;
    }
    perOrder.set(it.order_id, rec);
  }

  let allNull = 0, allClean = 0, mixed = 0, allDrift = 0;
  const byDate: Record<string, { orders: number; nullOrders: number; driftOrders: number }> = {};
  const problemOrders: { num: string; date: string; tot: number; nul: number; drift: number; clover: string }[] = [];
  for (const [oid, r] of perOrder) {
    const o = ordById.get(oid);
    const date = (o?.created_at || '').slice(0, 10);
    byDate[date] = byDate[date] || { orders: 0, nullOrders: 0, driftOrders: 0 };
    byDate[date].orders++;
    const fullyClean = r.nul === 0 && r.drift === 0;
    if (r.nul === r.tot) allNull++;
    else if (fullyClean) allClean++;
    else mixed++;
    if (r.drift === r.tot && r.tot > 0) allDrift++;
    if (r.nul > 0) byDate[date].nullOrders++;
    if (r.drift > 0) byDate[date].driftOrders++;
    if (r.nul > 0 || r.drift > 0) {
      problemOrders.push({ num: o?.order_number || oid.slice(0, 8), date, tot: r.tot, nul: r.nul, drift: r.drift, clover: o?.clover_order_id || '(none)' });
    }
  }

  console.log(`Orders with catalog modifiers: ${perOrder.size}\n`);
  console.log('=== Per-order signature ===');
  console.log(`  fully clean:          ${allClean}`);
  console.log(`  ALL modifiers null:   ${allNull}  <- session had empty catalog`);
  console.log(`  ALL modifiers drift:  ${allDrift}  <- cart built against an older catalog export`);
  console.log(`  mixed:                ${mixed}`);

  console.log('\n=== By date (orders / withNull / withDrift) ===');
  for (const [d, s] of Object.entries(byDate).sort()) {
    const flag = s.nullOrders > 0 || s.driftOrders > 0 ? '  <—' : '';
    console.log(`  ${d}  ${String(s.orders).padStart(2)} ord  null:${String(s.nullOrders).padStart(2)}  drift:${String(s.driftOrders).padStart(2)}${flag}`);
  }

  console.log('\n=== Problem orders (most recent 40) ===');
  for (const p of problemOrders.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 40)) {
    console.log(`  ${p.date}  ${p.num.padEnd(16)} clover=${(p.clover).padEnd(14)} mods=${p.tot} null=${p.nul} drift=${p.drift}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
