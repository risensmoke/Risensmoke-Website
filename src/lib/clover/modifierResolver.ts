/**
 * Server-side Clover modifier resolver.
 *
 * The order UI resolves each catalog modifier's `cloverModId` at add-to-cart
 * time, client-side, from data fetched async via /api/menu. If that data isn't
 * loaded in the customer's browser at that moment (slow load, stale build, an
 * old persisted cart), the modifier is saved with a null cloverModId — and
 * Clover silently drops modifications it can't tie to a catalog modifier, so
 * sides/meats vanish from the kitchen ticket.
 *
 * This module re-resolves cloverModId on the SERVER at submission time, against
 * the same committed menu + production mappings, so a cart that was captured
 * without IDs (or against an older catalog export) self-heals before it reaches
 * Clover. Resolution is deterministic: itemModifierGroupMapping pins each item's
 * selection to exactly one Clover modifier group, so a modifier name resolves
 * unambiguously even though the same name exists in several groups.
 *
 * Read the JSON the same way /api/menu does (src/data) so the two never diverge.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

interface MenuModifier {
  id: string;
  name: string;
}
interface MenuModifierGroup {
  id: string;
  modifiers: MenuModifier[];
}
interface MenuItem {
  id: string;
  name: string;
}
interface MenuData {
  modifierGroups: MenuModifierGroup[];
  items: MenuItem[];
  itemModifierGroupMapping?: Record<string, Record<string, string>>;
}
interface CloverMappings {
  modifiers: Record<string, string>;
}

// Map the category stored on a saved modifier to the website modifier-group id.
// These are the catalog-backed selections that Clover needs an id for; other
// categories (Size, Weight) depend on per-item groups and are left as-is.
const CATEGORY_TO_GROUP: Record<string, string> = {
  meat: 'meat-selection',
  side: 'side-selection',
  condiment: 'condiments',
  topping: 'add-on-toppings',
};

function readData<T>(filename: string): T | null {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'src', 'data', filename), 'utf-8')) as T;
  } catch {
    return null;
  }
}

interface ResolverData {
  groups: MenuModifierGroup[];
  itemIdByName: Map<string, string>;
  mapping: Record<string, Record<string, string>>;
  cloverByLocalId: Record<string, string>;
}

let cached: ResolverData | null = null;

function load(): ResolverData | null {
  if (cached) return cached;
  const menu = readData<MenuData>('menu-data.json');
  if (!menu) return null;

  // Match /api/menu: prefer production mappings when pointed at live Clover.
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.CLOVER_API_BASE_URL?.includes('api.clover.com');
  const map =
    (isProduction ? readData<CloverMappings>('clover-mappings-production.json') : null) ||
    readData<CloverMappings>('clover-mappings-sandbox.json');
  if (!map) return null;

  const itemIdByName = new Map<string, string>();
  for (const it of menu.items || []) itemIdByName.set(it.name.toLowerCase(), it.id);

  cached = {
    groups: menu.modifierGroups || [],
    itemIdByName,
    mapping: menu.itemModifierGroupMapping || {},
    cloverByLocalId: map.modifiers || {},
  };
  return cached;
}

/**
 * Resolve the current Clover modifier id for a saved modifier, by the item it
 * belongs to, the modifier's category, and its name. Returns undefined if it
 * can't be resolved (unknown item/name, or a category without a group mapping).
 */
export function resolveCloverModId(
  itemName: string,
  category: string | undefined | null,
  modifierName: string
): string | undefined {
  const data = load();
  if (!data) return undefined;

  const baseGroupId = CATEGORY_TO_GROUP[(category || '').toLowerCase()];
  if (!baseGroupId) return undefined; // not a catalog-backed category we resolve

  // Apply the per-item group remap (e.g. Revelation Plate side-selection ->
  // side-selection-2) exactly as getCloverModId does client-side.
  const itemId = data.itemIdByName.get((itemName || '').toLowerCase());
  let groupId = baseGroupId;
  if (itemId && data.mapping[itemId]?.[baseGroupId]) {
    groupId = data.mapping[itemId][baseGroupId];
  }

  for (const group of data.groups) {
    if (group.id !== groupId) continue;
    const mod = group.modifiers.find(
      (m) => m.name.toLowerCase() === (modifierName || '').toLowerCase()
    );
    if (mod) return data.cloverByLocalId[mod.id] || undefined;
  }
  return undefined;
}

/** Is this category one we re-resolve server-side? */
export function isResolvableCategory(category: string | undefined | null): boolean {
  return !!CATEGORY_TO_GROUP[(category || '').toLowerCase()];
}

// Test/maintenance hook: drop the in-memory cache.
export function _resetResolverCache(): void {
  cached = null;
}
