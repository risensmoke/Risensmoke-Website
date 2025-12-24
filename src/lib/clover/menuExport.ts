/**
 * Menu Export to Clover (JSON-based)
 * Reads menu from JSON file and exports to Clover POS
 * Saves mappings for each environment (sandbox/production)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Environment configuration
const CLOVER_API_BASE_URL = process.env.CLOVER_API_BASE_URL || 'https://sandbox.dev.clover.com';
const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const CLOVER_ACCESS_TOKEN = process.env.CLOVER_ACCESS_TOKEN;

// Determine environment from URL
const IS_SANDBOX = CLOVER_API_BASE_URL.includes('sandbox');
const ENV_NAME = IS_SANDBOX ? 'sandbox' : 'production';

// File paths
const DATA_DIR = join(process.cwd(), 'data');
const MENU_FILE = join(DATA_DIR, 'menu-data.json');
const MAPPINGS_FILE = join(DATA_DIR, `clover-mappings-${ENV_NAME}.json`);

// Types
interface MenuData {
  version: string;
  lastUpdated: string;
  restaurant: {
    name: string;
    address: string;
    phone: string;
  };
  categories: CategoryData[];
  modifierGroups: ModifierGroupData[];
  items: ItemData[];
}

interface CategoryData {
  id: string;
  name: string;
  sortOrder: number;
}

interface ModifierGroupData {
  id: string;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number | null;
  modifiers: ModifierData[];
}

interface ModifierData {
  id: string;
  name: string;
  price: number;
}

interface ItemData {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  available: boolean;
  modifierGroupIds: string[];
}

interface CloverMappings {
  environment: string;
  exportedAt: string;
  merchantId: string;
  categories: { [localId: string]: string };
  modifierGroups: { [localId: string]: string };
  modifiers: { [localId: string]: string };
  items: { [localId: string]: string };
}

interface ExportResult {
  success: boolean;
  environment: string;
  categoriesCreated: number;
  modifierGroupsCreated: number;
  modifiersCreated: number;
  itemsCreated: number;
  errors: string[];
  mappingsFile: string;
}

/**
 * Make authenticated request to Clover API
 */
async function cloverRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown
): Promise<T> {
  if (!CLOVER_MERCHANT_ID || !CLOVER_ACCESS_TOKEN) {
    throw new Error('Clover configuration missing: CLOVER_MERCHANT_ID or CLOVER_ACCESS_TOKEN');
  }

  const url = `${CLOVER_API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${CLOVER_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Clover API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Load menu data from JSON file
 */
function loadMenuData(): MenuData {
  if (!existsSync(MENU_FILE)) {
    throw new Error(`Menu file not found: ${MENU_FILE}`);
  }
  const content = readFileSync(MENU_FILE, 'utf-8');
  return JSON.parse(content);
}

/**
 * Load existing mappings if available
 */
function loadMappings(): CloverMappings | null {
  if (!existsSync(MAPPINGS_FILE)) {
    return null;
  }
  try {
    const content = readFileSync(MAPPINGS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Save mappings to file
 */
function saveMappings(mappings: CloverMappings): void {
  writeFileSync(MAPPINGS_FILE, JSON.stringify(mappings, null, 2));
  console.log(`[Export] Mappings saved to: ${MAPPINGS_FILE}`);
}

/**
 * Create a category in Clover
 */
async function createCategory(category: CategoryData): Promise<string> {
  const result = await cloverRequest<{ id: string }>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/categories`,
    'POST',
    {
      name: category.name,
      sortOrder: category.sortOrder,
    }
  );
  return result.id;
}

/**
 * Create a modifier group in Clover
 */
async function createModifierGroup(
  group: ModifierGroupData
): Promise<{ groupId: string; modifierIds: { [localId: string]: string } }> {
  // Create the modifier group
  const groupResult = await cloverRequest<{ id: string }>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/modifier_groups`,
    'POST',
    {
      name: group.name,
      minRequired: group.minSelections,
      maxAllowed: group.maxSelections,
      showByDefault: true,
    }
  );

  const modifierIds: { [localId: string]: string } = {};

  // Create modifiers within the group
  for (const modifier of group.modifiers) {
    const modResult = await cloverRequest<{ id: string }>(
      `/v3/merchants/${CLOVER_MERCHANT_ID}/modifier_groups/${groupResult.id}/modifiers`,
      'POST',
      {
        name: modifier.name,
        price: Math.round(modifier.price * 100), // Convert to cents
        available: true,
      }
    );
    modifierIds[modifier.id] = modResult.id;
  }

  return { groupId: groupResult.id, modifierIds };
}

/**
 * Create an item in Clover
 */
async function createItem(
  item: ItemData,
  categoryId: string
): Promise<string> {
  const result = await cloverRequest<{ id: string }>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/items`,
    'POST',
    {
      name: item.name,
      price: Math.round(item.price * 100), // Convert to cents
      priceType: 'FIXED',
      defaultTaxRates: true,
      available: item.available,
      hidden: false,
    }
  );

  // Associate item with category
  await cloverRequest(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/category_items`,
    'POST',
    {
      elements: [
        {
          category: { id: categoryId },
          item: { id: result.id },
        },
      ],
    }
  );

  return result.id;
}

/**
 * Associate modifier groups with an item
 */
async function associateModifierGroups(
  itemId: string,
  modifierGroupIds: string[]
): Promise<void> {
  for (const groupId of modifierGroupIds) {
    await cloverRequest(
      `/v3/merchants/${CLOVER_MERCHANT_ID}/item_modifier_groups`,
      'POST',
      {
        elements: [
          {
            item: { id: itemId },
            modifierGroup: { id: groupId },
          },
        ],
      }
    );
  }
}

/**
 * Export menu to Clover from JSON file
 */
export async function exportMenuToClover(): Promise<ExportResult> {
  const errors: string[] = [];
  let categoriesCreated = 0;
  let modifierGroupsCreated = 0;
  let modifiersCreated = 0;
  let itemsCreated = 0;

  // Initialize mappings
  const mappings: CloverMappings = {
    environment: ENV_NAME,
    exportedAt: new Date().toISOString(),
    merchantId: CLOVER_MERCHANT_ID || '',
    categories: {},
    modifierGroups: {},
    modifiers: {},
    items: {},
  };

  try {
    // Load menu data
    console.log(`[Export] Loading menu from: ${MENU_FILE}`);
    const menuData = loadMenuData();
    console.log(`[Export] Found ${menuData.categories.length} categories, ${menuData.modifierGroups.length} modifier groups, ${menuData.items.length} items`);

    // Step 1: Create categories
    console.log('[Export] Creating categories...');
    for (const category of menuData.categories) {
      try {
        const cloverId = await createCategory(category);
        mappings.categories[category.id] = cloverId;
        categoriesCreated++;
        console.log(`  ✓ ${category.name} -> ${cloverId}`);
      } catch (error) {
        const msg = `Failed to create category "${category.name}": ${error}`;
        errors.push(msg);
        console.error(`  ✗ ${msg}`);
      }
    }

    // Step 2: Create modifier groups
    console.log('[Export] Creating modifier groups...');
    for (const group of menuData.modifierGroups) {
      try {
        const { groupId, modifierIds } = await createModifierGroup(group);
        mappings.modifierGroups[group.id] = groupId;
        Object.assign(mappings.modifiers, modifierIds);
        modifierGroupsCreated++;
        modifiersCreated += Object.keys(modifierIds).length;
        console.log(`  ✓ ${group.name} -> ${groupId} (${Object.keys(modifierIds).length} modifiers)`);
      } catch (error) {
        const msg = `Failed to create modifier group "${group.name}": ${error}`;
        errors.push(msg);
        console.error(`  ✗ ${msg}`);
      }
    }

    // Step 3: Create items
    console.log('[Export] Creating items...');
    for (const item of menuData.items) {
      try {
        // Get Clover category ID
        const clovercategoryId = mappings.categories[item.categoryId];
        if (!clovercategoryId) {
          errors.push(`Category not found for item "${item.name}"`);
          continue;
        }

        // Create item
        const cloverItemId = await createItem(item, clovercategoryId);
        mappings.items[item.id] = cloverItemId;
        itemsCreated++;

        // Associate modifier groups
        const cloverModGroupIds = item.modifierGroupIds
          .map(id => mappings.modifierGroups[id])
          .filter(Boolean);

        if (cloverModGroupIds.length > 0) {
          await associateModifierGroups(cloverItemId, cloverModGroupIds);
        }

        console.log(`  ✓ ${item.name} -> ${cloverItemId}`);
      } catch (error) {
        const msg = `Failed to create item "${item.name}": ${error}`;
        errors.push(msg);
        console.error(`  ✗ ${msg}`);
      }
    }

    // Save mappings
    saveMappings(mappings);

    return {
      success: errors.length === 0,
      environment: ENV_NAME,
      categoriesCreated,
      modifierGroupsCreated,
      modifiersCreated,
      itemsCreated,
      errors,
      mappingsFile: MAPPINGS_FILE,
    };
  } catch (error) {
    errors.push(`Export failed: ${error}`);
    return {
      success: false,
      environment: ENV_NAME,
      categoriesCreated,
      modifierGroupsCreated,
      modifiersCreated,
      itemsCreated,
      errors,
      mappingsFile: MAPPINGS_FILE,
    };
  }
}

/**
 * Get current mappings for an environment
 */
export function getMappings(): CloverMappings | null {
  return loadMappings();
}

/**
 * Check if menu has been exported
 */
export function hasBeenExported(): boolean {
  return existsSync(MAPPINGS_FILE);
}

export const menuExportService = {
  exportMenuToClover,
  getMappings,
  hasBeenExported,
};
