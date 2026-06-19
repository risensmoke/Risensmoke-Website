/**
 * Diagnostic: characterize WHY cloverModId is null on saved plate modifiers.
 * - If nulls cluster on specific side NAMES -> name/catalog mismatch.
 * - If a whole order has ALL modifiers (meats+sides) null -> load-timing race
 *   (Clover menu data not loaded when the plate was customized).
 *
 * Read-only. Run: npx tsx scripts/diagnose-null-pattern.ts
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PLATE_NAMES = [
  'Gospel Plate', 'Disciples Plate', 'Trinity Plate', 'Revelation Plate',
  'Rise N Smoke A Little', 'Rise N Smoke A Lot',
  'Small Smoke Stack', 'Medium Smoke Stack', 'Large Smoke Stack',
];
interface Mod { name?: string; category?: string | null; cloverModId?: string | null; }

async function main() {
  const { data } = await supabase
    .from('order_items')
    .select('order_id, item_name, modifiers, created_at')
    .in('item_name', PLATE_NAMES)
    .order('created_at', { ascending: true });

  const bySideName: Record<string, { total: number; nullId: number }> = {};
  // Per line item: is EVERY modifier null, or only some?
  let allNullItems = 0, partialNullItems = 0, cleanItems = 0;

  for (const it of data || []) {
    const mods = (it.modifiers || []) as Mod[];
    if (mods.length === 0) { continue; }
    let nullCount = 0;
    for (const m of mods) {
      if (!m.cloverModId) nullCount++;
      if ((m.category || '').toLowerCase() === 'side') {
        const k = m.name || '(unnamed)';
        bySideName[k] = bySideName[k] || { total: 0, nullId: 0 };
        bySideName[k].total++;
        if (!m.cloverModId) bySideName[k].nullId++;
      }
    }
    if (nullCount === 0) cleanItems++;
    else if (nullCount === mods.length) allNullItems++;
    else partialNullItems++;
  }

  console.log('Per-side-name cloverModId nulls:');
  for (const [name, s] of Object.entries(bySideName).sort((a, b) => b[1].nullId - a[1].nullId)) {
    console.log(`  ${name.padEnd(28)} ${s.nullId}/${s.total} null`);
  }
  console.log('\nPer plate line item (all modifiers):');
  console.log(`  fully resolved (0 null):     ${cleanItems}`);
  console.log(`  ALL modifiers null:          ${allNullItems}  <- load-timing race signature`);
  console.log(`  PARTIAL null (some names):   ${partialNullItems}  <- name-mismatch signature`);
}
main().catch((e) => { console.error(e); process.exit(1); });
