/**
 * Update Clover Modifier Constraints Script
 *
 * This script updates the item-modifier group associations in Clover
 * with the correct min/max selection constraints from menu-data.json.
 *
 * Usage:
 *   npx tsx scripts/update-clover-modifier-constraints.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local', override: true });

const CLOVER_API_BASE_URL = process.env.CLOVER_API_BASE_URL || 'https://api.clover.com';
const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const CLOVER_ACCESS_TOKEN = process.env.CLOVER_ACCESS_TOKEN;

const DELAY_MS = 300;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ModifierGroupConstraint {
  groupId: string;
  min: number;
  max: number | null;
}

interface MenuItem {
  id: string;
  name: string;
  modifierGroups?: ModifierGroupConstraint[];
}

interface MenuData {
  items: MenuItem[];
}

interface CloverMappings {
  items: Record<string, string>;
  modifierGroups: Record<string, string>;
}

interface ItemModifierGroupAssociation {
  id: string;
  item: { id: string };
  modifierGroup: { id: string };
  minRequired?: number;
  maxAllowed?: number;
}

async function cloverFetch<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: object
): Promise<T> {
  if (!CLOVER_MERCHANT_ID || !CLOVER_ACCESS_TOKEN) {
    throw new Error('Missing CLOVER_MERCHANT_ID or CLOVER_ACCESS_TOKEN');
  }

  const url = `${CLOVER_API_BASE_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${CLOVER_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Clover API error ${response.status}: ${errorText}`);
  }

  const text = await response.text();
  if (!text) return {} as T;

  return JSON.parse(text);
}

async function deleteItemModifierGroup(itemId: string, modifierGroupId: string): Promise<void> {
  await cloverFetch(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/item_modifier_groups?item.id=${itemId}&modifierGroup.id=${modifierGroupId}`,
    'DELETE'
  );
}

async function createItemModifierGroupWithConstraints(
  itemId: string,
  modifierGroupId: string,
  minRequired: number,
  maxAllowed: number | null
): Promise<void> {
  const body: {
    item: { id: string };
    modifierGroup: { id: string };
    minRequired?: number;
    maxAllowed?: number;
  } = {
    item: { id: itemId },
    modifierGroup: { id: modifierGroupId },
  };

  if (minRequired > 0) {
    body.minRequired = minRequired;
  }
  if (maxAllowed !== null) {
    body.maxAllowed = maxAllowed;
  }

  await cloverFetch(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/item_modifier_groups`,
    'POST',
    body
  );
}

async function main() {
  console.log('='.repeat(60));
  console.log('Update Clover Modifier Constraints');
  console.log('='.repeat(60));
  console.log(`Merchant ID: ${CLOVER_MERCHANT_ID}`);
  console.log('');

  // Load menu data with constraints
  const menuDataPath = path.join(__dirname, '../src/data/menu-data.json');
  const menuData: MenuData = JSON.parse(fs.readFileSync(menuDataPath, 'utf-8'));

  // Load Clover mappings
  const mappingsPath = path.join(__dirname, '../src/data/clover-mappings-production.json');
  const mappings: CloverMappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf-8'));

  // Process each item's modifier group constraints
  console.log('Updating modifier constraints (delete & recreate with constraints)...\n');
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const item of menuData.items) {
    if (!item.modifierGroups || item.modifierGroups.length === 0) {
      continue;
    }

    const cloverItemId = mappings.items[item.id];
    if (!cloverItemId) {
      console.log(`  ⚠ Item "${item.name}" not found in mappings, skipping`);
      skippedCount++;
      continue;
    }

    for (const modGroup of item.modifierGroups) {
      const cloverModGroupId = mappings.modifierGroups[modGroup.groupId];
      if (!cloverModGroupId) {
        console.log(`  ⚠ Modifier group "${modGroup.groupId}" not found in mappings, skipping`);
        skippedCount++;
        continue;
      }

      // Only process if there are actual constraints (min > 0 or max is set)
      if (modGroup.min > 0 || modGroup.max !== null) {
        try {
          // Delete existing association
          await deleteItemModifierGroup(cloverItemId, cloverModGroupId);
          await sleep(DELAY_MS);

          // Recreate with constraints
          await createItemModifierGroupWithConstraints(
            cloverItemId,
            cloverModGroupId,
            modGroup.min,
            modGroup.max
          );
          console.log(`  ✓ ${item.name} -> ${modGroup.groupId}: min=${modGroup.min}, max=${modGroup.max}`);
          updatedCount++;
          await sleep(DELAY_MS);
        } catch (error) {
          console.error(`  ✗ Error updating ${item.name} -> ${modGroup.groupId}:`, error);
          errorCount++;
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Update Complete!');
  console.log('='.repeat(60));
  console.log(`Associations updated: ${updatedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
}

main().catch((error) => {
  console.error('Update failed:', error);
  process.exit(1);
});
