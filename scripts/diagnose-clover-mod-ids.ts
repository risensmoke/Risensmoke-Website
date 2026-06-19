/**
 * Diagnostic: For saved plate orders, check whether each Side modifier has a
 * cloverModId. A null/missing cloverModId means the side is saved locally but
 * cannot be (or is not) sent to Clover -> "missing sides" on the Clover ticket.
 *
 * Read-only. Run: npx tsx scripts/diagnose-clover-mod-ids.ts
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

interface Modifier { name?: string; category?: string | null; cloverModId?: string | null; }

async function main() {
  const { data, error } = await supabase
    .from('order_items')
    .select('id, order_id, item_name, modifiers, created_at')
    .in('item_name', PLATE_NAMES)
    .order('created_at', { ascending: false });

  if (error) { console.error(error.message); process.exit(1); }
  const rows = data || [];

  let totalSides = 0;
  let sidesNullClover = 0;
  const affectedOrderIds = new Set<string>();

  for (const it of rows) {
    const mods = (it.modifiers || []) as Modifier[];
    for (const m of mods) {
      if ((m.category || '').toLowerCase() === 'side') {
        totalSides++;
        if (!m.cloverModId) {
          sidesNullClover++;
          affectedOrderIds.add(it.order_id);
        }
      }
    }
  }

  console.log(`Plate line items scanned:        ${rows.length}`);
  console.log(`Total Side modifiers saved:      ${totalSides}`);
  console.log(`Side modifiers w/ NULL cloverModId: ${sidesNullClover}`);
  console.log(`Distinct orders affected:        ${affectedOrderIds.size}`);

  if (affectedOrderIds.size === 0) return;

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, clover_order_id, created_at')
    .in('id', [...affectedOrderIds])
    .order('created_at', { ascending: false });

  console.log('\nAffected orders (side saved locally but no Clover mod id):');
  for (const o of orders || []) {
    console.log(`  ${o.order_number}  clover=${o.clover_order_id ?? '(none)'}  ${o.created_at}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
