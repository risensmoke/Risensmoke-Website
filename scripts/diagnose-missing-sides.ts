/**
 * Diagnostic: Find plate orders where side items were not saved.
 *
 * Plates require a fixed number of sides (stored as order_items.modifiers
 * entries with category === 'Side'). This script flags any plate line item
 * whose saved Side-modifier count is less than the required sideCount.
 *
 * Read-only. Run with:
 *   npx tsx scripts/diagnose-missing-sides.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Prefer service role so RLS can't hide rows; fall back to anon.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars (.env.local).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Plate item_name -> required side count. Keyed by the display name stored in
// order_items.item_name (see app/order/page.tsx menuItems + plateConfigs).
const PLATE_SIDE_REQUIREMENTS: Record<string, number> = {
  'Gospel Plate': 2,
  'Disciples Plate': 2,
  'Trinity Plate': 2,
  'Revelation Plate': 2,
  'Rise N Smoke A Little': 2,
  'Rise N Smoke A Lot': 2,
  'Small Smoke Stack': 2,
  'Medium Smoke Stack': 2,
  'Large Smoke Stack': 3,
};

interface Modifier {
  name?: string;
  price?: number;
  category?: string | null;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  item_name: string;
  quantity: number;
  modifiers: Modifier[] | null;
  created_at: string;
}

function countSides(mods: Modifier[] | null): number {
  if (!Array.isArray(mods)) return 0;
  return mods.filter((m) => (m.category || '').toLowerCase() === 'side').length;
}

async function main() {
  const plateNames = Object.keys(PLATE_SIDE_REQUIREMENTS);

  const { data: items, error } = await supabase
    .from('order_items')
    .select('id, order_id, item_name, quantity, modifiers, created_at')
    .in('item_name', plateNames)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Query failed:', error.message);
    process.exit(1);
  }

  const rows = (items || []) as OrderItemRow[];

  const offenders = rows
    .map((it) => {
      const required = PLATE_SIDE_REQUIREMENTS[it.item_name] ?? 0;
      const found = countSides(it.modifiers);
      return { it, required, found, missing: required - found };
    })
    .filter((r) => r.found < r.required);

  console.log(`Scanned ${rows.length} plate line items.`);
  console.log(`Found ${offenders.length} with missing sides.\n`);

  if (offenders.length === 0) return;

  // Pull order context for the offenders.
  const orderIds = [...new Set(offenders.map((o) => o.it.order_id))];
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, clover_order_id, customer_email, customer_phone, total, status, created_at')
    .in('id', orderIds);

  const orderById = new Map((orders || []).map((o) => [o.id, o]));

  for (const o of offenders) {
    const ord = orderById.get(o.it.order_id);
    console.log('────────────────────────────────────────');
    console.log(`Order #:        ${ord?.order_number ?? '(unknown)'}`);
    console.log(`Clover order:   ${ord?.clover_order_id ?? '(none)'}`);
    console.log(`Placed:         ${ord?.created_at ?? o.it.created_at}`);
    console.log(`Status:         ${ord?.status ?? '?'}`);
    console.log(`Customer:       ${ord?.customer_email ?? '?'} / ${ord?.customer_phone ?? '?'}`);
    console.log(`Item:           ${o.it.item_name} (qty ${o.it.quantity})`);
    console.log(`Sides saved:    ${o.found} of ${o.required} required  -> MISSING ${o.missing}`);
    const savedCats = (o.it.modifiers || []).map((m) => `${m.category ?? '?'}:${m.name ?? '?'}`);
    console.log(`Modifiers:      ${savedCats.length ? savedCats.join(', ') : '(none)'}`);
  }

  console.log('────────────────────────────────────────');
  console.log(`\nTotal affected line items: ${offenders.length}`);
  console.log(`Across ${orderIds.length} distinct orders.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
