/**
 * Menu API
 * GET /api/menu - Get menu data with Clover IDs merged
 */

import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
}

interface MenuModifier {
  id: string;
  name: string;
  price: number;
}

interface MenuModifierGroup {
  id: string;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number | null;
  modifiers: MenuModifier[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  available: boolean;
  modifierGroupIds: string[];
}

interface MenuData {
  version: string;
  lastUpdated: string;
  restaurant: {
    name: string;
    address: string;
    phone: string;
  };
  categories: MenuCategory[];
  modifierGroups: MenuModifierGroup[];
  items: MenuItem[];
  itemModifierGroupMapping?: Record<string, Record<string, string>>;
}

interface CloverMappings {
  environment: string;
  categories: Record<string, string>;
  modifierGroups: Record<string, string>;
  modifiers: Record<string, string>;
  items: Record<string, string>;
}

// Read JSON files at runtime
function readJsonFile<T>(filename: string): T | null {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

function getMenuData(): MenuData | null {
  return readJsonFile<MenuData>('menu-data.json');
}

function getCloverMappings(): CloverMappings {
  const isProduction = process.env.NODE_ENV === 'production' ||
    process.env.CLOVER_API_BASE_URL?.includes('api.clover.com');

  // Try production mappings first if in production
  if (isProduction) {
    const prodMappings = readJsonFile<CloverMappings>('clover-mappings-production.json');
    if (prodMappings) return prodMappings;
  }

  // Fall back to sandbox mappings
  return readJsonFile<CloverMappings>('clover-mappings-sandbox.json') || {
    environment: 'sandbox',
    categories: {},
    modifierGroups: {},
    modifiers: {},
    items: {},
  };
}

export async function GET() {
  const menuData = getMenuData();
  if (!menuData) {
    return NextResponse.json({ error: 'Menu data not found' }, { status: 500 });
  }

  const cloverMappings = getCloverMappings();

  // Merge Clover IDs into menu data
  const categories = menuData.categories.map((cat) => ({
    ...cat,
    cloverCategoryId: cloverMappings.categories[cat.id],
  }));

  const modifierGroups = menuData.modifierGroups.map((group) => ({
    ...group,
    cloverModifierGroupId: cloverMappings.modifierGroups[group.id],
    modifiers: group.modifiers.map((mod) => ({
      ...mod,
      cloverModId: cloverMappings.modifiers[mod.id],
    })),
  }));

  const items = menuData.items.map((item) => ({
    ...item,
    cloverItemId: cloverMappings.items[item.id],
  }));

  return NextResponse.json({
    version: menuData.version,
    lastUpdated: menuData.lastUpdated,
    restaurant: menuData.restaurant,
    cloverEnvironment: cloverMappings.environment,
    categories,
    modifierGroups,
    items,
    itemModifierGroupMapping: menuData.itemModifierGroupMapping || {},
  });
}
