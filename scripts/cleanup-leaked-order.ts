/**
 * One-time cleanup (2026-08-31), user-approved:
 *  1. Delete the leaked unpaid Clover order WZ9034YVADCJC (Scott Barker,
 *     $25.33, 2026-08-26): web checkout created it, payment failed, and the
 *     automatic delete also failed, leaving it open in Clover forever.
 *     Guarded: aborts unless the order is still unpaid.
 *  2. Retro-mark historical dead checkout rows (no Clover order, no payment,
 *     still stamped CONFIRMED) as PAYMENT_FAILED to match the new status
 *     semantics shipped alongside this script.
 *
 * Run: npx tsx scripts/cleanup-leaked-order.ts
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
config({ path: '.env.local' });

const BASE = process.env.CLOVER_API_BASE_URL!;
const MID = process.env.CLOVER_MERCHANT_ID!;
const TOKEN = process.env.CLOVER_ACCESS_TOKEN!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LEAKED_ORDER_ID = 'WZ9034YVADCJC';

async function main() {
  const headers = { Authorization: `Bearer ${TOKEN}` };

  const check = await fetch(`${BASE}/v3/merchants/${MID}/orders/${LEAKED_ORDER_ID}`, { headers });
  if (check.status === 404) {
    console.log(`Leaked order ${LEAKED_ORDER_ID}: already gone.`);
  } else if (!check.ok) {
    console.log(`Leaked order ${LEAKED_ORDER_ID}: fetch failed HTTP ${check.status}, not deleting.`);
  } else {
    const order = await check.json();
    if (order.paymentState && order.paymentState !== 'OPEN') {
      console.log(`ABORT: order ${LEAKED_ORDER_ID} paymentState=${order.paymentState} (not unpaid).`);
    } else {
      const del = await fetch(`${BASE}/v3/merchants/${MID}/orders/${LEAKED_ORDER_ID}`, {
        method: 'DELETE',
        headers,
      });
      console.log(`DELETE ${LEAKED_ORDER_ID}: HTTP ${del.status}`);
      const verify = await fetch(`${BASE}/v3/merchants/${MID}/orders/${LEAKED_ORDER_ID}`, { headers });
      console.log(`Verify: HTTP ${verify.status} (404 = deleted)`);
    }
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'PAYMENT_FAILED' })
    .is('clover_order_id', null)
    .is('payment_intent_id', null)
    .eq('status', 'CONFIRMED')
    .select('order_number');
  if (error) console.log('Retro-update ERROR:', error.message);
  else console.log(`Retro-marked ${data?.length ?? 0} dead checkout rows as PAYMENT_FAILED.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
