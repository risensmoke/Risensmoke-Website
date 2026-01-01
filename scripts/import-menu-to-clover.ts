/**
 * Import Menu to Clover Script
 *
 * This script imports the full menu (categories, modifier groups, modifiers, and items)
 * from menu-data.json into your Clover merchant account.
 *
 * Usage:
 *   npx ts-node scripts/import-menu-to-clover.ts
 *
 * Environment variables (reads from .env.local):
 *   CLOVER_API_BASE_URL - https://sandbox.dev.clover.com or https://api.clover.com
 *   CLOVER_MERCHANT_ID - Your merchant ID
 *   CLOVER_ACCESS_TOKEN - Your API access token
 *
 * For production, update .env.local with production credentials before running.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local', override: true });

const CLOVER_API_BASE_URL = process.env.CLOVER_API_BASE_URL || 'https://sandbox.dev.clover.com';
const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const CLOVER_ACCESS_TOKEN = process.env.CLOVER_ACCESS_TOKEN;

// Determine environment from URL
const environment = CLOVER_API_BASE_URL.includes('sandbox') ? 'sandbox' : 'production';

// Test mode - import a single category for testing
// Usage: npx ts-node scripts/import-menu-to-clover.ts --test
// Or specify category: npx ts-node scripts/import-menu-to-clover.ts --test --category=favorites
const TEST_MODE = process.argv.includes('--test');
const categoryArg = process.argv.find(arg => arg.startsWith('--category='));
const TEST_CATEGORY = categoryArg ? categoryArg.split('=')[1] : 'favorites';

// Rate limiting - Clover API has rate limits
const DELAY_MS = 250;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Types
interface LocalCategory {
  id: string;
  name: string;
  sortOrder: number;
}

interface LocalModifier {
  id: string;
  name: string;
  price: number;
}

interface LocalModifierGroup {
  id: string;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number | null;
  cloverOnly?: boolean;
  modifiers: LocalModifier[];
}

interface ItemModifierGroupConfig {
  groupId: string;
  min: number;
  max: number | null;
}

interface LocalItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  available: boolean;
  modifierGroups?: ItemModifierGroupConfig[];
  modifierGroupIds?: string[]; // Legacy format support
}

interface MenuData {
  categories: LocalCategory[];
  modifierGroups: LocalModifierGroup[];
  items: LocalItem[];
  itemModifierGroupMapping?: Record<string, Record<string, string>>;
}

// ID mappings (local ID -> Clover ID)
const categoryMap = new Map<string, string>();
const modifierGroupMap = new Map<string, string>();
const modifierMap = new Map<string, string>();
const itemMap = new Map<string, string>();

async function cloverFetch<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: object
): Promise<T> {
  if (!CLOVER_MERCHANT_ID || !CLOVER_ACCESS_TOKEN) {
    throw new Error('Missing CLOVER_MERCHANT_ID or CLOVER_ACCESS_TOKEN in environment');
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

  // Handle empty responses
  const text = await response.text();
  if (!text) return {} as T;

  return JSON.parse(text);
}

async function createCategory(category: LocalCategory): Promise<string> {
  console.log(`  Creating category: ${category.name}`);

  const result = await cloverFetch<{ id: string }>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/categories`,
    'POST',
    {
      name: category.name,
      sortOrder: category.sortOrder,
    }
  );

  await sleep(DELAY_MS);
  return result.id;
}

async function createModifierGroup(group: LocalModifierGroup): Promise<string> {
  console.log(`  Creating modifier group: ${group.name}`);

  const result = await cloverFetch<{ id: string }>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/modifier_groups`,
    'POST',
    {
      name: group.name,
      minRequired: group.minSelections,
      maxAllowed: group.maxSelections,
      showByDefault: true,
    }
  );

  await sleep(DELAY_MS);
  return result.id;
}

async function createModifier(
  modifierGroupId: string,
  modifier: LocalModifier
): Promise<string> {
  console.log(`    Creating modifier: ${modifier.name}`);

  // Clover prices are in cents
  const priceInCents = Math.round(modifier.price * 100);

  const result = await cloverFetch<{ id: string }>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/modifier_groups/${modifierGroupId}/modifiers`,
    'POST',
    {
      name: modifier.name,
      price: priceInCents,
    }
  );

  await sleep(DELAY_MS);
  return result.id;
}

async function createItem(item: LocalItem): Promise<string> {
  console.log(`  Creating item: ${item.name}`);

  // Clover prices are in cents
  const priceInCents = Math.round(item.price * 100);

  const result = await cloverFetch<{ id: string }>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/items`,
    'POST',
    {
      name: item.name,
      price: priceInCents,
      priceType: 'FIXED',
      defaultTaxRates: true,
      hidden: !item.available,
      isRevenue: true,
      showInReporting: true,
    }
  );

  // Enable item for online ordering (separate API call required for this field)
  try {
    await cloverFetch(
      `/v3/merchants/${CLOVER_MERCHANT_ID}/items/${result.id}`,
      'PUT',
      {
        available: true,
        enabledOnline: true,
      }
    );
    await sleep(DELAY_MS);
  } catch (error) {
    console.log(`    Warning: Could not enable online ordering for ${item.name}`);
  }

  await sleep(DELAY_MS);
  return result.id;
}

async function linkItemToCategory(itemId: string, categoryId: string): Promise<void> {
  await cloverFetch(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/category_items`,
    'POST',
    {
      elements: [
        {
          item: { id: itemId },
          category: { id: categoryId },
        },
      ],
    }
  );
  await sleep(DELAY_MS);
}

async function linkItemToModifierGroup(
  itemId: string,
  modifierGroupId: string
): Promise<void> {
  // Constraints are set at the modifier group level, not per-item
  await cloverFetch(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/item_modifier_groups`,
    'POST',
    {
      elements: [
        {
          item: { id: itemId },
          modifierGroup: { id: modifierGroupId },
        },
      ],
    }
  );
  await sleep(DELAY_MS);
}

// Tag (Label) functions for kitchen printer routing
async function getExistingTags(): Promise<{ id: string; name: string }[]> {
  const result = await cloverFetch<{ elements: { id: string; name: string }[] }>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/tags`
  );
  return result.elements || [];
}

async function createTag(name: string): Promise<string> {
  console.log(`  Creating tag: ${name}`);
  const result = await cloverFetch<{ id: string }>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/tags`,
    'POST',
    {
      name,
      showInReporting: true,
    }
  );
  await sleep(DELAY_MS);
  return result.id;
}

async function getOrCreateKitchenTag(): Promise<string> {
  const existingTags = await getExistingTags();
  const kitchenTag = existingTags.find(t => t.name.toUpperCase() === 'KITCHEN');

  if (kitchenTag) {
    console.log(`  Found existing KITCHEN tag: ${kitchenTag.id}`);
    return kitchenTag.id;
  }

  return await createTag('KITCHEN');
}

async function tagItem(itemId: string, tagId: string): Promise<void> {
  await cloverFetch(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/tag_items`,
    'POST',
    {
      elements: [
        {
          item: { id: itemId },
          tag: { id: tagId },
        },
      ],
    }
  );
  await sleep(DELAY_MS);
}

async function importMenu() {
  console.log('='.repeat(60));
  console.log('Clover Menu Import Script');
  console.log('='.repeat(60));
  console.log(`Environment: ${environment}`);
  console.log(`API Base URL: ${CLOVER_API_BASE_URL}`);
  console.log(`Merchant ID: ${CLOVER_MERCHANT_ID}`);
  console.log('');

  if (environment === 'production') {
    console.log('WARNING: You are importing to PRODUCTION!');
    console.log('Press Ctrl+C within 5 seconds to cancel...');
    await sleep(5000);
  }

  // Load menu data
  const menuDataPath = path.join(__dirname, '../src/data/menu-data.json');
  console.log(`\nLoading menu data from: ${menuDataPath}`);

  const menuData: MenuData = JSON.parse(fs.readFileSync(menuDataPath, 'utf-8'));

  // Apply test mode filters
  if (TEST_MODE) {
    console.log(`\n*** TEST MODE - Only importing category: ${TEST_CATEGORY} ***\n`);
    menuData.categories = menuData.categories.filter(c => c.id === TEST_CATEGORY);
    menuData.items = menuData.items.filter(i => i.categoryId === TEST_CATEGORY);

    // Get the modifier groups needed for all items in this category
    const neededGroups = new Set<string>();
    for (const item of menuData.items) {
      if (item.modifierGroups) {
        for (const mg of item.modifierGroups) {
          // Add both the website group and the Clover group (from mapping)
          neededGroups.add(mg.groupId);
          const mapping = menuData.itemModifierGroupMapping?.[item.id]?.[mg.groupId];
          if (mapping) neededGroups.add(mapping);
        }
      }
    }
    menuData.modifierGroups = menuData.modifierGroups.filter(g => neededGroups.has(g.id));
  }

  console.log(`  Categories: ${menuData.categories.length}`);
  console.log(`  Modifier Groups: ${menuData.modifierGroups.length}`);
  console.log(`  Items: ${menuData.items.length}`);

  // Step 1: Create Categories
  console.log('\n' + '-'.repeat(60));
  console.log('Step 1: Creating Categories');
  console.log('-'.repeat(60));

  for (const category of menuData.categories) {
    try {
      const cloverId = await createCategory(category);
      categoryMap.set(category.id, cloverId);
      console.log(`    -> Clover ID: ${cloverId}`);
    } catch (error) {
      console.error(`    ERROR creating ${category.name}:`, error);
    }
  }

  // Step 2: Create Modifier Groups and Modifiers
  console.log('\n' + '-'.repeat(60));
  console.log('Step 2: Creating Modifier Groups and Modifiers');
  console.log('-'.repeat(60));

  for (const group of menuData.modifierGroups) {
    try {
      const groupCloverId = await createModifierGroup(group);
      modifierGroupMap.set(group.id, groupCloverId);
      console.log(`    -> Clover ID: ${groupCloverId}`);

      // Create modifiers within this group
      for (const modifier of group.modifiers) {
        try {
          const modCloverId = await createModifier(groupCloverId, modifier);
          modifierMap.set(modifier.id, modCloverId);
          console.log(`      -> Clover ID: ${modCloverId}`);
        } catch (error) {
          console.error(`      ERROR creating modifier ${modifier.name}:`, error);
        }
      }
    } catch (error) {
      console.error(`    ERROR creating group ${group.name}:`, error);
    }
  }

  // Step 3: Create Items
  console.log('\n' + '-'.repeat(60));
  console.log('Step 3: Creating Items');
  console.log('-'.repeat(60));

  for (const item of menuData.items) {
    try {
      const itemCloverId = await createItem(item);
      itemMap.set(item.id, itemCloverId);
      console.log(`    -> Clover ID: ${itemCloverId}`);
    } catch (error) {
      console.error(`    ERROR creating ${item.name}:`, error);
    }
  }

  // Step 4: Link Items to Categories
  console.log('\n' + '-'.repeat(60));
  console.log('Step 4: Linking Items to Categories');
  console.log('-'.repeat(60));

  for (const item of menuData.items) {
    const itemCloverId = itemMap.get(item.id);
    const categoryCloverId = categoryMap.get(item.categoryId);

    if (itemCloverId && categoryCloverId) {
      try {
        await linkItemToCategory(itemCloverId, categoryCloverId);
        console.log(`  Linked ${item.name} -> ${item.categoryId}`);
      } catch (error) {
        console.error(`  ERROR linking ${item.name} to category:`, error);
      }
    }
  }

  // Step 5: Link Items to Modifier Groups (using cross-reference mapping)
  console.log('\n' + '-'.repeat(60));
  console.log('Step 5: Linking Items to Modifier Groups');
  console.log('-'.repeat(60));

  // Get the cross-reference mapping
  const itemMapping = menuData.itemModifierGroupMapping || {};

  for (const item of menuData.items) {
    const itemCloverId = itemMap.get(item.id);

    if (!itemCloverId) continue;

    // Get item-specific mapping if it exists
    const itemGroupMapping = itemMapping[item.id] || {};

    if (item.modifierGroups && item.modifierGroups.length > 0) {
      for (const modGroup of item.modifierGroups) {
        // Check if this item has a specific Clover group mapping
        const cloverGroupId = itemGroupMapping[modGroup.groupId] || modGroup.groupId;
        const modGroupCloverId = modifierGroupMap.get(cloverGroupId);

        if (modGroupCloverId) {
          try {
            // No per-item constraints needed - constraints are at the group level now
            await linkItemToModifierGroup(itemCloverId, modGroupCloverId);
            console.log(`  Linked ${item.name} -> ${cloverGroupId}`);
          } catch (error) {
            console.error(`  ERROR linking ${item.name} to ${cloverGroupId}:`, error);
          }
        } else {
          console.log(`  SKIP ${item.name} -> ${cloverGroupId} (group not found, may be website-only)`);
        }
      }
    }
  }

  // Step 6: Tag all items with KITCHEN label for kitchen printer routing
  console.log('\n' + '-'.repeat(60));
  console.log('Step 6: Tagging Items with KITCHEN Label');
  console.log('-'.repeat(60));

  const kitchenTagId = await getOrCreateKitchenTag();
  console.log(`  Using KITCHEN tag ID: ${kitchenTagId}`);

  let taggedCount = 0;
  for (const item of menuData.items) {
    const itemCloverId = itemMap.get(item.id);
    if (itemCloverId) {
      try {
        await tagItem(itemCloverId, kitchenTagId);
        taggedCount++;
        console.log(`  Tagged ${item.name}`);
      } catch (error) {
        console.error(`  ERROR tagging ${item.name}:`, error);
      }
    }
  }
  console.log(`\nTagged ${taggedCount}/${menuData.items.length} items with KITCHEN label`);

  // Save mappings
  const mappings = {
    environment,
    importedAt: new Date().toISOString(),
    merchantId: CLOVER_MERCHANT_ID,
    categories: Object.fromEntries(categoryMap),
    modifierGroups: Object.fromEntries(modifierGroupMap),
    modifiers: Object.fromEntries(modifierMap),
    items: Object.fromEntries(itemMap),
  };

  const outputPath = path.join(__dirname, `../src/data/clover-mappings-${environment}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(mappings, null, 2));

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Import Complete!');
  console.log('='.repeat(60));
  console.log(`Categories created: ${categoryMap.size}/${menuData.categories.length}`);
  console.log(`Modifier groups created: ${modifierGroupMap.size}/${menuData.modifierGroups.length}`);
  console.log(`Modifiers created: ${modifierMap.size}`);
  console.log(`Items created: ${itemMap.size}/${menuData.items.length}`);
  console.log(`\nMappings saved to: ${outputPath}`);
  console.log('\nNext step: Verify items in Clover Dashboard, then run:');
  console.log('  npx ts-node scripts/export-clover-ids.ts');
}

// Run the script
importMenu().catch((error) => {
  console.error('\nImport failed:', error);
  process.exit(1);
});
