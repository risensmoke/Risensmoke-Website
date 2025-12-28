/**
 * Fix Modifier Constraints Script
 *
 * This script deletes existing item-modifier group associations and recreates them
 * with the correct min/max constraints. Items themselves are preserved.
 *
 * Usage:
 *   npx tsx scripts/fix-modifier-constraints.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local', override: true });

const CLOVER_API_BASE_URL = process.env.CLOVER_API_BASE_URL || 'https://api.clover.com';
const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const CLOVER_ACCESS_TOKEN = process.env.CLOVER_ACCESS_TOKEN;

const DELAY_MS = 350;
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

async function deleteItemModifierAssociation(itemId: string, modifierGroupId: string): Promise<boolean> {
  try {
    // Try the item-specific endpoint
    await cloverFetch(
      `/v3/merchants/${CLOVER_MERCHANT_ID}/items/${itemId}/modifier_groups/${modifierGroupId}`,
      'DELETE'
    );
    return true;
  } catch (error) {
    // If that fails, the association might not exist or endpoint not supported
    return false;
  }
}

async function createItemModifierAssociation(
  itemId: string,
  modifierGroupId: string,
  minRequired: number,
  maxAllowed: number | null
): Promise<boolean> {
  try {
    const body: {
      modifierGroup: { id: string };
      minRequired?: number;
      maxAllowed?: number;
    } = {
      modifierGroup: { id: modifierGroupId },
    };

    // Add constraints
    if (minRequired > 0) {
      body.minRequired = minRequired;
    }
    if (maxAllowed !== null) {
      body.maxAllowed = maxAllowed;
    }

    await cloverFetch(
      `/v3/merchants/${CLOVER_MERCHANT_ID}/items/${itemId}/modifier_groups`,
      'POST',
      body
    );
    return true;
  } catch (error) {
    console.error(`    Error creating association:`, error);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Fix Modifier Constraints Script');
  console.log('='.repeat(60));
  console.log(`Merchant ID: ${CLOVER_MERCHANT_ID}`);
  console.log('');

  // Load menu data with constraints
  const menuDataPath = path.join(__dirname, '../src/data/menu-data.json');
  const menuData: MenuData = JSON.parse(fs.readFileSync(menuDataPath, 'utf-8'));

  // Load Clover mappings
  const mappingsPath = path.join(__dirname, '../src/data/clover-mappings-production.json');
  const mappings: CloverMappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf-8'));

  console.log('This will fix modifier constraints for items with min/max settings.');
  console.log('Press Ctrl+C within 3 seconds to cancel...');
  await sleep(3000);

  let fixedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const item of menuData.items) {
    if (!item.modifierGroups || item.modifierGroups.length === 0) {
      continue;
    }

    const cloverItemId = mappings.items[item.id];
    if (!cloverItemId) {
      console.log(`  Skip: ${item.name} - not in mappings`);
      skippedCount++;
      continue;
    }

    for (const modGroup of item.modifierGroups) {
      // Only process groups with actual constraints
      if (modGroup.min === 0 && modGroup.max === null) {
        continue;
      }

      const cloverModGroupId = mappings.modifierGroups[modGroup.groupId];
      if (!cloverModGroupId) {
        console.log(`  Skip: ${modGroup.groupId} - not in mappings`);
        skippedCount++;
        continue;
      }

      console.log(`\n${item.name} -> ${modGroup.groupId}`);
      console.log(`  Target: min=${modGroup.min}, max=${modGroup.max ?? 'unlimited'}`);

      // Step 1: Delete existing association
      console.log(`  Deleting existing association...`);
      const deleted = await deleteItemModifierAssociation(cloverItemId, cloverModGroupId);
      if (deleted) {
        console.log(`  Deleted successfully`);
      } else {
        console.log(`  No existing association or delete not supported`);
      }
      await sleep(DELAY_MS);

      // Step 2: Create new association with constraints
      console.log(`  Creating with constraints...`);
      const created = await createItemModifierAssociation(
        cloverItemId,
        cloverModGroupId,
        modGroup.min,
        modGroup.max
      );

      if (created) {
        console.log(`  Created successfully with min=${modGroup.min}, max=${modGroup.max}`);
        fixedCount++;
      } else {
        console.log(`  Failed to create association`);
        errorCount++;
      }
      await sleep(DELAY_MS);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Fix Complete!');
  console.log('='.repeat(60));
  console.log(`Fixed: ${fixedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log('\nPlease verify constraints in Clover Dashboard.');
}

main().catch((error) => {
  console.error('Fix failed:', error);
  process.exit(1);
});
