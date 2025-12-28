/**
 * Delete Clover Inventory Script
 *
 * This script deletes only the items, categories, and modifier groups that were
 * imported via our menu system (items with Show Online enabled).
 * It uses the clover-mappings file to know which IDs to delete.
 *
 * Usage:
 *   npx tsx scripts/delete-clover-inventory.ts
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

interface CloverMappings {
  items: Record<string, string>;
  categories: Record<string, string>;
  modifierGroups: Record<string, string>;
}

async function cloverFetch<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
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

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Clover API error ${response.status}: ${errorText}`);
  }

  const text = await response.text();
  if (!text) return {} as T;

  return JSON.parse(text);
}

async function deleteMappedItems(mappings: CloverMappings): Promise<number> {
  const itemIds = Object.values(mappings.items);
  console.log(`  Found ${itemIds.length} items to delete from mappings`);

  let deleted = 0;
  for (const [localId, cloverId] of Object.entries(mappings.items)) {
    try {
      await cloverFetch(
        `/v3/merchants/${CLOVER_MERCHANT_ID}/items/${cloverId}`,
        'DELETE'
      );
      console.log(`  Deleted item: ${localId} (${cloverId})`);
      deleted++;
      await sleep(DELAY_MS);
    } catch (error) {
      console.error(`  Error deleting ${localId}:`, error);
    }
  }
  return deleted;
}

async function deleteMappedCategories(mappings: CloverMappings): Promise<number> {
  const categoryIds = Object.values(mappings.categories);
  console.log(`  Found ${categoryIds.length} categories to delete from mappings`);

  let deleted = 0;
  for (const [localId, cloverId] of Object.entries(mappings.categories)) {
    try {
      await cloverFetch(
        `/v3/merchants/${CLOVER_MERCHANT_ID}/categories/${cloverId}`,
        'DELETE'
      );
      console.log(`  Deleted category: ${localId} (${cloverId})`);
      deleted++;
      await sleep(DELAY_MS);
    } catch (error) {
      console.error(`  Error deleting ${localId}:`, error);
    }
  }
  return deleted;
}

async function deleteMappedModifierGroups(mappings: CloverMappings): Promise<number> {
  const groupIds = Object.values(mappings.modifierGroups);
  console.log(`  Found ${groupIds.length} modifier groups to delete from mappings`);

  let deleted = 0;
  for (const [localId, cloverId] of Object.entries(mappings.modifierGroups)) {
    try {
      await cloverFetch(
        `/v3/merchants/${CLOVER_MERCHANT_ID}/modifier_groups/${cloverId}`,
        'DELETE'
      );
      console.log(`  Deleted modifier group: ${localId} (${cloverId})`);
      deleted++;
      await sleep(DELAY_MS);
    } catch (error) {
      console.error(`  Error deleting ${localId}:`, error);
    }
  }
  return deleted;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Delete Clover Inventory Script');
  console.log('='.repeat(60));
  console.log(`Merchant ID: ${CLOVER_MERCHANT_ID}`);
  console.log(`API URL: ${CLOVER_API_BASE_URL}`);
  console.log('');

  // Load the mappings file to know what to delete
  const mappingsPath = path.join(__dirname, '../src/data/clover-mappings-production.json');
  if (!fs.existsSync(mappingsPath)) {
    console.error('Mappings file not found:', mappingsPath);
    console.error('Run the export script first to create mappings.');
    process.exit(1);
  }

  const mappings: CloverMappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf-8'));

  console.log('This will delete only items from our menu mappings:');
  console.log(`  - ${Object.keys(mappings.items).length} items`);
  console.log(`  - ${Object.keys(mappings.categories).length} categories`);
  console.log(`  - ${Object.keys(mappings.modifierGroups).length} modifier groups`);
  console.log('');
  console.log('Press Ctrl+C within 5 seconds to cancel...');
  await sleep(5000);

  console.log('\n' + '-'.repeat(60));
  console.log('Step 1: Deleting Items');
  console.log('-'.repeat(60));
  const itemsDeleted = await deleteMappedItems(mappings);

  console.log('\n' + '-'.repeat(60));
  console.log('Step 2: Deleting Categories');
  console.log('-'.repeat(60));
  const categoriesDeleted = await deleteMappedCategories(mappings);

  console.log('\n' + '-'.repeat(60));
  console.log('Step 3: Deleting Modifier Groups');
  console.log('-'.repeat(60));
  const groupsDeleted = await deleteMappedModifierGroups(mappings);

  console.log('\n' + '='.repeat(60));
  console.log('Deletion Complete!');
  console.log('='.repeat(60));
  console.log(`Items deleted: ${itemsDeleted}`);
  console.log(`Categories deleted: ${categoriesDeleted}`);
  console.log(`Modifier groups deleted: ${groupsDeleted}`);
  console.log('\nYou can now run the import script:');
  console.log('  npx tsx scripts/import-menu-to-clover.ts');
}

main().catch((error) => {
  console.error('Deletion failed:', error);
  process.exit(1);
});
