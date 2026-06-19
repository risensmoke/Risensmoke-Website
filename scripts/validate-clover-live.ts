/**
 * Validate committed Clover mappings against the LIVE Clover catalog.
 *
 * Pulls every modifier group + modifier from the Clover REST API and checks:
 *  - Does each cloverModId in clover-mappings-production.json still EXIST in Clover?
 *  - Do the names match?
 *  - Are there modifiers our mappings reference that Clover no longer has (stale)?
 * Read-only against Clover (GET only). Run: npx tsx scripts/validate-clover-live.ts
 */
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
config({ path: '.env.local' });

const BASE = process.env.CLOVER_API_BASE_URL!;
const MID = process.env.CLOVER_MERCHANT_ID!;
const TOKEN = process.env.CLOVER_ACCESS_TOKEN!;

async function clover<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} on ${path}`);
  return res.json() as Promise<T>;
}

interface CloverElem { id: string; name?: string }

async function fetchAllModifiers(): Promise<Map<string, string>> {
  // id -> name, paging through modifier_groups with expanded modifiers
  const byId = new Map<string, string>();
  let offset = 0;
  const limit = 100;
  for (;;) {
    const data = await clover<{ elements: { id: string; name: string; modifiers?: { elements: CloverElem[] } }[] }>(
      `/v3/merchants/${MID}/modifier_groups?expand=modifiers&limit=${limit}&offset=${offset}`
    );
    const groups = data.elements || [];
    for (const g of groups) {
      for (const m of g.modifiers?.elements || []) byId.set(m.id, m.name || '');
    }
    if (groups.length < limit) break;
    offset += limit;
  }
  return byId;
}

const read = (f: string) => JSON.parse(readFileSync(join(process.cwd(), 'src', 'data', f), 'utf-8'));

async function main() {
  console.log(`Clover: ${BASE} merchant ${MID}\n`);
  const live = await fetchAllModifiers();
  console.log(`Live Clover modifiers fetched: ${live.size}`);

  const menu = read('menu-data.json');
  const map = read('clover-mappings-production.json');
  const nameByLocalId: Record<string, string> = {};
  for (const g of menu.modifierGroups || []) for (const m of g.modifiers || []) nameByLocalId[m.id] = m.name;

  let ok = 0, missing = 0, nameMismatch = 0;
  const problems: string[] = [];
  for (const [localId, cloverId] of Object.entries(map.modifiers || {})) {
    const cid = cloverId as string;
    const expectedName = nameByLocalId[localId] || '(unknown local id)';
    if (!live.has(cid)) {
      missing++;
      problems.push(`MISSING in Clover: ${localId} -> ${cid}  (expected "${expectedName}")`);
    } else {
      const liveName = live.get(cid)!;
      ok++;
      if (expectedName && liveName && liveName.toLowerCase() !== expectedName.toLowerCase()) {
        nameMismatch++;
        problems.push(`NAME MISMATCH: ${localId} -> ${cid}  file="${expectedName}"  clover="${liveName}"`);
      }
    }
  }

  console.log(`\nMapped modifiers in committed file: ${Object.keys(map.modifiers || {}).length}`);
  console.log(`  exist in live Clover:   ${ok}`);
  console.log(`  MISSING (stale id):     ${missing}`);
  console.log(`  name mismatches:        ${nameMismatch}`);

  if (problems.length) {
    console.log('\n--- problems ---');
    for (const p of problems.slice(0, 60)) console.log('  ' + p);
  } else {
    console.log('\nAll committed cloverModIds exist in the live Clover catalog with matching names.');
  }

  // Spot-check a few IDs that the order page would resolve for Revelation Plate
  console.log('\n--- live existence of IDs resolved for Revelation Plate (from prior analysis) ---');
  const spot = ['DW4DN38ERWCYT', 'KEXFKB8YGDHA6', 'XDTHN06TM6S68', 'ASX03STNX0ZQW', '6NKJ49YBKS6JJ'];
  for (const id of spot) console.log(`  ${id}  live=${live.has(id) ? 'YES "' + live.get(id) + '"' : 'NO'}`);

  // Also: which live modifiers are NOT referenced by our file (informational)
  const referenced = new Set(Object.values(map.modifiers || {}) as string[]);
  let unref = 0;
  for (const id of live.keys()) if (!referenced.has(id)) unref++;
  console.log(`\nLive Clover modifiers NOT referenced by our mapping file: ${unref} (of ${live.size})`);

  // CI gate: a stale (missing) id WILL drop a modifier from the kitchen ticket,
  // so fail the check. Name mismatches are cosmetic (Clover abbreviates display
  // names out-of-band) and only warn.
  if (missing > 0) {
    console.error(`\nFAIL: ${missing} mapped cloverModId(s) no longer exist in the live Clover catalog.`);
    process.exit(1);
  }
  console.log('\nOK: every mapped cloverModId exists in the live Clover catalog.');
}
main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
