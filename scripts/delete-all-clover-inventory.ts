/**
 * Delete ALL Clover Inventory Script
 *
 * This script deletes ALL items, categories, and modifier groups from Clover.
 * Use with caution - this is a complete wipe of inventory!
 *
 * Usage:
 *   npx tsx scripts/delete-all-clover-inventory.ts
 *
 * Add --force to skip confirmation:
 *   npx tsx scripts/delete-all-clover-inventory.ts --force
 */

import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local', override: true });

const CLOVER_API_BASE_URL = process.env.CLOVER_API_BASE_URL || 'https://api.clover.com';
const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const CLOVER_ACCESS_TOKEN = process.env.CLOVER_ACCESS_TOKEN;

const DELAY_MS = 200;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const FORCE_MODE = process.argv.includes('--force');

interface CloverElement {
  id: string;
  name: string;
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

async function fetchAllItems(): Promise<CloverElement[]> {
  const response = await cloverFetch<{ elements: CloverElement[] }>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/items?limit=500`
  );
  return response.elements || [];
}

async function fetchAllCategories(): Promise<CloverElement[]> {
  const response = await cloverFetch<{ elements: CloverElement[] }>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/categories?limit=500`
  );
  return response.elements || [];
}

async function fetchAllModifierGroups(): Promise<CloverElement[]> {
  const response = await cloverFetch<{ elements: CloverElement[] }>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/modifier_groups?limit=500`
  );
  return response.elements || [];
}

async function fetchAllTags(): Promise<CloverElement[]> {
  const response = await cloverFetch<{ elements: CloverElement[] }>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/tags?limit=500`
  );
  return response.elements || [];
}

async function deleteItem(id: string, name: string): Promise<boolean> {
  try {
    await cloverFetch(
      `/v3/merchants/${CLOVER_MERCHANT_ID}/items/${id}`,
      'DELETE'
    );
    console.log(`  ✓ Deleted item: ${name}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Failed to delete item ${name}:`, error);
    return false;
  }
}

async function deleteCategory(id: string, name: string): Promise<boolean> {
  try {
    await cloverFetch(
      `/v3/merchants/${CLOVER_MERCHANT_ID}/categories/${id}`,
      'DELETE'
    );
    console.log(`  ✓ Deleted category: ${name}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Failed to delete category ${name}:`, error);
    return false;
  }
}

async function deleteModifierGroup(id: string, name: string): Promise<boolean> {
  try {
    await cloverFetch(
      `/v3/merchants/${CLOVER_MERCHANT_ID}/modifier_groups/${id}`,
      'DELETE'
    );
    console.log(`  ✓ Deleted modifier group: ${name}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Failed to delete modifier group ${name}:`, error);
    return false;
  }
}

async function deleteTag(id: string, name: string): Promise<boolean> {
  try {
    await cloverFetch(
      `/v3/merchants/${CLOVER_MERCHANT_ID}/tags/${id}`,
      'DELETE'
    );
    console.log(`  ✓ Deleted tag: ${name}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Failed to delete tag ${name}:`, error);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('DELETE ALL CLOVER INVENTORY');
  console.log('='.repeat(60));
  console.log(`Environment: ${CLOVER_API_BASE_URL.includes('sandbox') ? 'SANDBOX' : 'PRODUCTION'}`);
  console.log(`Merchant ID: ${CLOVER_MERCHANT_ID}`);
  console.log('');

  // Fetch current inventory
  console.log('Fetching current inventory...');
  const items = await fetchAllItems();
  const categories = await fetchAllCategories();
  const modifierGroups = await fetchAllModifierGroups();
  const tags = await fetchAllTags();

  console.log(`\nFound:`);
  console.log(`  - ${items.length} items`);
  console.log(`  - ${categories.length} categories`);
  console.log(`  - ${modifierGroups.length} modifier groups`);
  console.log(`  - ${tags.length} tags (labels)`);

  if (items.length === 0 && categories.length === 0 && modifierGroups.length === 0 && tags.length === 0) {
    console.log('\nClover inventory is already empty!');
    return;
  }

  console.log('\n*** WARNING: This will DELETE ALL inventory from Clover! ***\n');

  if (!FORCE_MODE) {
    console.log('Press Ctrl+C within 10 seconds to cancel...');
    await sleep(10000);
  }

  // Step 1: Delete all items first (must be done before categories)
  if (items.length > 0) {
    console.log('\n' + '-'.repeat(60));
    console.log('Step 1: Deleting Items');
    console.log('-'.repeat(60));
    let deletedItems = 0;
    for (const item of items) {
      if (await deleteItem(item.id, item.name)) {
        deletedItems++;
      }
      await sleep(DELAY_MS);
    }
    console.log(`\nDeleted ${deletedItems}/${items.length} items`);
  }

  // Step 2: Delete all categories
  if (categories.length > 0) {
    console.log('\n' + '-'.repeat(60));
    console.log('Step 2: Deleting Categories');
    console.log('-'.repeat(60));
    let deletedCategories = 0;
    for (const category of categories) {
      if (await deleteCategory(category.id, category.name)) {
        deletedCategories++;
      }
      await sleep(DELAY_MS);
    }
    console.log(`\nDeleted ${deletedCategories}/${categories.length} categories`);
  }

  // Step 3: Delete all modifier groups (this also deletes their modifiers)
  if (modifierGroups.length > 0) {
    console.log('\n' + '-'.repeat(60));
    console.log('Step 3: Deleting Modifier Groups');
    console.log('-'.repeat(60));
    let deletedGroups = 0;
    for (const group of modifierGroups) {
      if (await deleteModifierGroup(group.id, group.name)) {
        deletedGroups++;
      }
      await sleep(DELAY_MS);
    }
    console.log(`\nDeleted ${deletedGroups}/${modifierGroups.length} modifier groups`);
  }

  // Step 4: Delete all tags (labels)
  if (tags.length > 0) {
    console.log('\n' + '-'.repeat(60));
    console.log('Step 4: Deleting Tags (Labels)');
    console.log('-'.repeat(60));
    let deletedTags = 0;
    for (const tag of tags) {
      if (await deleteTag(tag.id, tag.name)) {
        deletedTags++;
      }
      await sleep(DELAY_MS);
    }
    console.log(`\nDeleted ${deletedTags}/${tags.length} tags`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Deletion Complete!');
  console.log('='.repeat(60));
  console.log('\nClover inventory is now empty. Run the import script:');
  console.log('  npx tsx scripts/import-menu-to-clover.ts');
}

main().catch((error) => {
  console.error('Deletion failed:', error);
  process.exit(1);
});
