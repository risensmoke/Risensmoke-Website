/**
 * Post-fix verification: did the server-side modifier re-resolution fix
 * (shipped 2026-06-19 evening, commits edb354b/5fe8c06) stop modifiers
 * being dropped from Clover orders?
 *
 * Read-only. Checks:
 *  1. modifier_resolution_log — how often the fix patched ids, and whether
 *     anything was UNRESOLVED (unresolved = modifier still dropped).
 *  2. Ground truth vs Clover: for every order since the fix with a
 *     clover_order_id, fetch the Clover order with lineItems.modifications
 *     expanded and compare per-line-item modification counts against the
 *     catalog modifiers saved in Supabase order_items.
 *
 * Run: npx tsx <this file>  (from the repo root)
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
config({ path: '.env.local' });

const FIX_DEPLOYED = '2026-06-19T23:30:00Z'; // ~18:30 CDT 2026-06-19

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BASE = process.env.CLOVER_API_BASE_URL!;
const MID = process.env.CLOVER_MERCHANT_ID!;
const TOKEN = process.env.CLOVER_ACCESS_TOKEN!;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function clover<T>(path: string): Promise<T | null> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (res.status === 429 && attempt < 6) {
      const retryAfter = Number(res.headers.get('retry-after')) || 0;
      await sleep(Math.max(retryAfter * 1000, 2000 * (attempt + 1)));
      continue;
    }
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} on ${path}`);
    return res.json() as Promise<T>;
  }
}

interface Mod { name?: string; category?: string | null; cloverModId?: string | null }
interface ItemRow { order_id: string; item_name: string; quantity: number; modifiers: Mod[] | null }
interface OrderRow { id: string; order_number: string; clover_order_id: string | null; status: string; created_at: string }

const CATALOG_CATS = ['meat', 'side', 'condiment', 'topping'];
const catalogMods = (mods: Mod[] | null) =>
  (mods || []).filter((m) => CATALOG_CATS.includes((m.category || '').toLowerCase()));

interface CloverLineItem { id: string; name?: string; modifications?: { elements: { id: string; name?: string }[] } }
interface CloverOrder { id: string; lineItems?: { elements: CloverLineItem[] } }

async function main() {
  console.log(`Fix deployed: ${FIX_DEPLOYED}\n`);

  // ── 1. modifier_resolution_log ────────────────────────────────────────────
  const { data: logRows, error: logErr } = await supabase
    .from('modifier_resolution_log')
    .select('*')
    .order('created_at', { ascending: true });
  if (logErr) console.log(`modifier_resolution_log query failed: ${logErr.message}`);
  else {
    console.log(`=== modifier_resolution_log: ${logRows!.length} events (cart arrived with missing/stale ids) ===`);
    let patched = 0, unresolved = 0;
    const unresolvedRows: typeof logRows = [];
    for (const r of logRows!) {
      patched += r.patched_count || 0;
      unresolved += r.unresolved_count || 0;
      if ((r.unresolved_count || 0) > 0) unresolvedRows.push(r);
    }
    console.log(`  total modifiers patched:    ${patched}`);
    console.log(`  total UNRESOLVED (dropped): ${unresolved}`);
    if (unresolvedRows.length) {
      console.log('  --- orders with unresolved modifiers ---');
      for (const r of unresolvedRows)
        console.log(`   ${r.created_at}  order ${r.order_number ?? r.order_id ?? '?'}  unresolved=${r.unresolved_count}  details=${JSON.stringify(r.details).slice(0, 300)}`);
    }
    // events per month
    const byMonth: Record<string, number> = {};
    for (const r of logRows!) byMonth[String(r.created_at).slice(0, 7)] = (byMonth[String(r.created_at).slice(0, 7)] || 0) + 1;
    console.log('  events by month: ' + Object.entries(byMonth).sort().map(([m, n]) => `${m}:${n}`).join('  '));
  }

  // ── 2. Post-fix orders vs Clover ground truth ─────────────────────────────
  const { data: orders, error: ordErr } = await supabase
    .from('orders')
    .select('id, order_number, clover_order_id, status, created_at')
    .gte('created_at', FIX_DEPLOYED)
    .order('created_at', { ascending: true });
  if (ordErr) { console.error(ordErr.message); process.exit(1); }

  const withClover = (orders as OrderRow[]).filter((o) => o.clover_order_id);
  console.log(`\n=== Post-fix orders: ${orders!.length} total, ${withClover.length} with a clover_order_id ===`);
  const skipped = (orders as OrderRow[]).filter((o) => !o.clover_order_id);
  if (skipped.length)
    console.log('  (no clover_order_id: ' + skipped.map((o) => `${o.order_number}[${o.status}]`).join(', ') + ')');

  const orderIds = withClover.map((o) => o.id);
  const items: ItemRow[] = [];
  for (let i = 0; i < orderIds.length; i += 100) {
    const { data, error } = await supabase
      .from('order_items')
      .select('order_id, item_name, quantity, modifiers')
      .in('order_id', orderIds.slice(i, i + 100));
    if (error) { console.error(error.message); process.exit(1); }
    items.push(...(data as ItemRow[]));
  }
  const itemsByOrder = new Map<string, ItemRow[]>();
  for (const it of items) {
    if (!itemsByOrder.has(it.order_id)) itemsByOrder.set(it.order_id, []);
    itemsByOrder.get(it.order_id)!.push(it);
  }

  let cleanOrders = 0, problemOrders = 0, cloverMissing = 0;
  let preFixStyleFailures = 0; // line item expected mods but got ZERO
  const problems: string[] = [];
  for (const o of withClover) {
    await sleep(1200); // stay under Clover's rate limit
    const results = [
      await clover<CloverOrder>(`/v3/merchants/${MID}/orders/${o.clover_order_id}?expand=lineItems.modifications`)
        .then((co) => ({ o, co, err: null as string | null }))
        .catch((e) => ({ o, co: null as CloverOrder | null, err: String(e.message || e) })),
    ];
    for (const { o, co, err } of results) {
      if (err) { problems.push(`  ${o.created_at} #${o.order_number}: Clover fetch error: ${err}`); problemOrders++; continue; }
      if (!co) { cloverMissing++; problems.push(`  ${o.created_at} #${o.order_number}: clover order ${o.clover_order_id} NOT FOUND (404)`); continue; }

      const sbItems = itemsByOrder.get(o.id) || [];
      // expected: sum over items of catalogMods * quantity (line items are
      // usually replicated per unit in Clover; we compare totals both ways)
      const expectedPerUnit = sbItems.reduce((s, it) => s + catalogMods(it.modifiers).length, 0);
      const expectedTimesQty = sbItems.reduce((s, it) => s + catalogMods(it.modifiers).length * (it.quantity || 1), 0);

      const cloverLines = co.lineItems?.elements || [];
      const gotTotal = cloverLines.reduce((s, li) => s + (li.modifications?.elements?.length || 0), 0);

      // per-line zero-mod check: any Clover line whose Supabase counterpart
      // (matched by name, case-insensitive substring either way) expected mods
      const zeroModLines: string[] = [];
      for (const li of cloverLines) {
        const got = li.modifications?.elements?.length || 0;
        if (got > 0) continue;
        const liName = (li.name || '').toLowerCase();
        const match = sbItems.find((it) => {
          const n = it.item_name.toLowerCase();
          return n === liName || liName.includes(n) || n.includes(liName);
        });
        if (match && catalogMods(match.modifiers).length > 0) zeroModLines.push(`"${li.name}" expected ${catalogMods(match.modifiers).length} mods, got 0`);
      }

      const totalOk = gotTotal >= expectedPerUnit; // conservative: at least the per-unit expectation
      if (zeroModLines.length === 0 && totalOk) cleanOrders++;
      else {
        problemOrders++;
        if (zeroModLines.length) preFixStyleFailures += zeroModLines.length;
        problems.push(
          `  ${o.created_at} #${o.order_number} (clover ${o.clover_order_id}): mods expected ~${expectedPerUnit}` +
          `${expectedTimesQty !== expectedPerUnit ? ` (x qty ${expectedTimesQty})` : ''}, Clover has ${gotTotal}` +
          (zeroModLines.length ? ` | BARE LINES: ${zeroModLines.join('; ')}` : '')
        );
      }
    }
  }

  console.log(`\n=== Clover ground-truth check (${withClover.length} orders) ===`);
  console.log(`  clean (all expected modifiers present): ${cleanOrders}`);
  console.log(`  problem orders:                         ${problemOrders}`);
  console.log(`  clover order not found (404):           ${cloverMissing}`);
  console.log(`  line items w/ expected mods but ZERO:   ${preFixStyleFailures}   <- the pre-fix failure signature`);
  if (problems.length) {
    console.log('\n--- details ---');
    for (const p of problems) console.log(p);
  }

  // ── 3. Supabase-side null rate by month (context) ─────────────────────────
  const byMonth: Record<string, { total: number; nul: number }> = {};
  {
    let from = 0; const page = 1000;
    for (;;) {
      const { data, error } = await supabase
        .from('order_items')
        .select('created_at, modifiers')
        .order('created_at', { ascending: true })
        .range(from, from + page - 1);
      if (error) { console.error(error.message); break; }
      if (!data || data.length === 0) break;
      for (const it of data as { created_at: string; modifiers: Mod[] | null }[]) {
        const mods = catalogMods(it.modifiers);
        if (!mods.length) continue;
        const m = it.created_at.slice(0, 7);
        byMonth[m] = byMonth[m] || { total: 0, nul: 0 };
        byMonth[m].total += mods.length;
        byMonth[m].nul += mods.filter((x) => !x.cloverModId).length;
      }
      if (data.length < page) break;
      from += page;
    }
  }
  console.log('\n=== Supabase cart null-cloverModId rate by month (fix repairs these server-side at charge) ===');
  for (const [m, s] of Object.entries(byMonth).sort())
    console.log(`  ${m}  ${String(s.nul).padStart(4)}/${String(s.total).padStart(4)} null  (${((s.nul / s.total) * 100).toFixed(0)}%)`);
}

main().catch((e) => { console.error('ERROR:', e); process.exit(1); });
