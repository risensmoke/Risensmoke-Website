/**
 * Export Clover IDs Script
 *
 * This script fetches all items, categories, and modifiers from Clover
 * and creates a mapping file that can be used by the website.
 *
 * Usage (requires environment variables to be set):
 *   CLOVER_API_BASE_URL=https://sandbox.dev.clover.com \
 *   CLOVER_MERCHANT_ID=your_merchant_id \
 *   CLOVER_ACCESS_TOKEN=your_token \
 *   npx ts-node scripts/export-clover-ids.ts
 *
 * For production:
 *   CLOVER_API_BASE_URL=https://api.clover.com \
 *   CLOVER_MERCHANT_ID=your_prod_merchant_id \
 *   CLOVER_ACCESS_TOKEN=your_prod_token \
 *   npx ts-node scripts/export-clover-ids.ts
 *
 * Output:
 *   src/data/clover-mappings-{environment}.json
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local (override any existing)
dotenv.config({ path: '.env.local', override: true });

const CLOVER_API_BASE_URL = process.env.CLOVER_API_BASE_URL || 'https://sandbox.dev.clover.com';
const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const CLOVER_ACCESS_TOKEN = process.env.CLOVER_ACCESS_TOKEN;

// Determine environment from URL
const environment = CLOVER_API_BASE_URL.includes('sandbox') ? 'sandbox' : 'production';

interface CloverElement {
  id: string;
  name: string;
}

interface CloverModifier extends CloverElement {
  price?: number;
}

interface CloverModifierGroup extends CloverElement {
  modifiers?: { elements: CloverModifier[] };
}

interface CloverItem extends CloverElement {
  price?: number;
  categories?: { elements: CloverElement[] };
  hidden?: boolean;
  enabledOnline?: boolean;
}

interface CloverCategory extends CloverElement {
  sortOrder?: number;
}

async function cloverFetch<T>(endpoint: string): Promise<T> {
  if (!CLOVER_MERCHANT_ID || !CLOVER_ACCESS_TOKEN) {
    throw new Error('Missing CLOVER_MERCHANT_ID or CLOVER_ACCESS_TOKEN in environment');
  }

  const url = `${CLOVER_API_BASE_URL}${endpoint}`;
  console.log(`Fetching: ${url}`);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${CLOVER_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Clover API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

async function exportCloverIds() {
  console.log('='.repeat(50));
  console.log('Clover ID Export Script');
  console.log('='.repeat(50));
  console.log(`Environment: ${environment}`);
  console.log(`Merchant ID: ${CLOVER_MERCHANT_ID}`);
  console.log('');

  // Load local menu data for matching
  const menuDataPath = path.join(__dirname, '../src/data/menu-data.json');
  const menuData = JSON.parse(fs.readFileSync(menuDataPath, 'utf-8'));

  // Fetch categories from Clover
  console.log('Fetching categories...');
  const categoriesResponse = await cloverFetch<{ elements: CloverCategory[] }>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/categories`
  );
  const cloverCategories = categoriesResponse.elements || [];
  console.log(`  Found ${cloverCategories.length} categories`);

  // Fetch modifier groups with modifiers from Clover
  console.log('Fetching modifier groups...');
  const modifierGroupsResponse = await cloverFetch<{ elements: CloverModifierGroup[] }>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/modifier_groups?expand=modifiers`
  );
  const cloverModifierGroups = modifierGroupsResponse.elements || [];
  console.log(`  Found ${cloverModifierGroups.length} modifier groups`);

  // Fetch items from Clover
  console.log('Fetching items...');
  const itemsResponse = await cloverFetch<{ elements: CloverItem[] }>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/items?expand=categories`
  );
  const allCloverItems = itemsResponse.elements || [];
  console.log(`  Found ${allCloverItems.length} total items in Clover`);

  // Filter to only include active items (not hidden AND enabled online)
  const cloverItems = allCloverItems.filter(
    (item) => item.hidden === false && item.enabledOnline === true
  );
  console.log(`  Filtered to ${cloverItems.length} active items (hidden=false, enabledOnline=true)`);

  // Build mappings by matching names
  const mappings = {
    environment,
    exportedAt: new Date().toISOString(),
    merchantId: CLOVER_MERCHANT_ID,
    categories: {} as Record<string, string>,
    modifierGroups: {} as Record<string, string>,
    modifiers: {} as Record<string, string>,
    items: {} as Record<string, string>,
  };

  // Match categories
  console.log('\nMatching categories...');
  for (const localCat of menuData.categories) {
    const cloverCat = cloverCategories.find(
      (c) => c.name.toLowerCase() === localCat.name.toLowerCase()
    );
    if (cloverCat) {
      mappings.categories[localCat.id] = cloverCat.id;
      console.log(`  ✓ ${localCat.name} → ${cloverCat.id}`);
    } else {
      console.log(`  ✗ ${localCat.name} - NOT FOUND in Clover`);
    }
  }

  // Match modifier groups and modifiers
  console.log('\nMatching modifier groups and modifiers...');
  for (const localGroup of menuData.modifierGroups) {
    const cloverGroup = cloverModifierGroups.find(
      (g) => g.name.toLowerCase() === localGroup.name.toLowerCase()
    );
    if (cloverGroup) {
      mappings.modifierGroups[localGroup.id] = cloverGroup.id;
      console.log(`  ✓ Group: ${localGroup.name} → ${cloverGroup.id}`);

      // Match modifiers within this group
      const cloverMods = cloverGroup.modifiers?.elements || [];
      for (const localMod of localGroup.modifiers) {
        const cloverMod = cloverMods.find(
          (m) => m.name.toLowerCase() === localMod.name.toLowerCase()
        );
        if (cloverMod) {
          mappings.modifiers[localMod.id] = cloverMod.id;
          console.log(`    ✓ ${localMod.name} → ${cloverMod.id}`);
        } else {
          console.log(`    ✗ ${localMod.name} - NOT FOUND`);
        }
      }
    } else {
      console.log(`  ✗ Group: ${localGroup.name} - NOT FOUND in Clover`);
    }
  }

  // Match items
  console.log('\nMatching items...');
  for (const localItem of menuData.items) {
    const cloverItem = cloverItems.find(
      (i) => i.name.toLowerCase() === localItem.name.toLowerCase()
    );
    if (cloverItem) {
      mappings.items[localItem.id] = cloverItem.id;
      console.log(`  ✓ ${localItem.name} → ${cloverItem.id}`);
    } else {
      console.log(`  ✗ ${localItem.name} - NOT FOUND in Clover`);
    }
  }

  // Write output file
  const outputPath = path.join(__dirname, `../src/data/clover-mappings-${environment}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(mappings, null, 2));

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Export Complete!');
  console.log('='.repeat(50));
  console.log(`Categories matched: ${Object.keys(mappings.categories).length}/${menuData.categories.length}`);
  console.log(`Modifier groups matched: ${Object.keys(mappings.modifierGroups).length}/${menuData.modifierGroups.length}`);
  console.log(`Modifiers matched: ${Object.keys(mappings.modifiers).length}`);
  console.log(`Items matched: ${Object.keys(mappings.items).length}/${menuData.items.length}`);
  console.log(`\nOutput saved to: ${outputPath}`);
}

// Run the script
exportCloverIds().catch((error) => {
  console.error('Export failed:', error);
  process.exit(1);
});
