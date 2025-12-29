# Rise N' Smoke - Clover POS Sync Admin Guide

## Overview

This guide explains how to keep the ecommerce website synchronized with Clover POS. The two systems maintain separate data stores that must be kept in sync for orders to process correctly.

### System Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│   ECOMMERCE SITE    │         │     CLOVER POS      │
├─────────────────────┤         ├─────────────────────┤
│ menu-data.json      │◄───────►│ Items/Categories    │
│ (source of truth    │  SYNC   │ Modifier Groups     │
│  for website)       │         │ Modifiers           │
├─────────────────────┤         ├─────────────────────┤
│ clover-mappings-    │         │ Clover IDs          │
│ production.json     │◄────────│ (auto-generated)    │
│ (ID translations)   │         │                     │
└─────────────────────┘         └─────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `src/data/menu-data.json` | Master menu data (items, categories, modifiers) |
| `src/data/clover-mappings-production.json` | Maps local IDs to Clover IDs |
| `scripts/import-menu-to-clover.ts` | Push menu from website → Clover |
| `scripts/export-clover-ids.ts` | Pull Clover IDs → website mappings |

---

## Golden Rules

1. **Website menu-data.json is the source of truth** for menu content (names, descriptions, prices)
2. **Clover generates the IDs** - never manually create Clover IDs
3. **Always update mappings** after any Clover changes
4. **Test in sandbox first** before making production changes

---

## Sync Scenarios

### ITEMS

#### Add a New Item

**Recommended: Start in Website**

1. Edit `src/data/menu-data.json`:
   ```json
   {
     "id": "new-item-id",
     "name": "New BBQ Item",
     "description": "Description here",
     "price": 14.99,
     "categoryId": "blessed-plates",
     "available": true,
     "modifierGroups": [
       { "groupId": "meat-selection", "min": 1, "max": 1 }
     ]
   }
   ```

2. Run import script to create in Clover:
   ```bash
   npx tsx scripts/import-menu-to-clover.ts
   ```

3. Run export script to get the Clover ID:
   ```bash
   npx tsx scripts/export-clover-ids.ts
   ```

4. Commit and deploy changes

**Alternative: Start in Clover Dashboard**

1. Create item in Clover Dashboard
2. Add `menu-data.json` entry with matching name
3. Run export script to capture the Clover ID:
   ```bash
   npx tsx scripts/export-clover-ids.ts
   ```
4. Commit and deploy

#### Modify an Item

| Change Type | Update Website | Update Clover | Run Export |
|-------------|----------------|---------------|------------|
| Name | Yes - menu-data.json | Yes - Dashboard or import script | Yes |
| Description | Yes - menu-data.json | N/A (Clover doesn't use) | No |
| Price | Yes - menu-data.json | Yes - Dashboard or import script | No |
| Category | Yes - menu-data.json | Yes - Dashboard or import script | No |
| Modifiers | Yes - menu-data.json | Yes - Dashboard or import script | No |
| Availability | Yes - menu-data.json | Yes - Dashboard | No |

**To modify via script:**
```bash
# Edit menu-data.json first, then:
npx tsx scripts/import-menu-to-clover.ts
```

**Note:** The import script updates existing items by matching on name.

#### Delete an Item

1. **In Clover Dashboard:** Delete the item (or mark as hidden/unavailable)

2. **In Website:** Remove from `menu-data.json`

3. **Update mappings:** Remove the item's entry from `clover-mappings-production.json`:
   ```json
   "items": {
     // Remove this line:
     "deleted-item-id": "CLOVER_ITEM_ID"
   }
   ```

4. Commit and deploy

---

### CATEGORIES

#### Add a Category

1. Edit `src/data/menu-data.json`:
   ```json
   {
     "id": "new-category",
     "name": "New Category Name",
     "sortOrder": 9
   }
   ```

2. Run import script:
   ```bash
   npx tsx scripts/import-menu-to-clover.ts
   ```

3. Run export script to get Clover ID:
   ```bash
   npx tsx scripts/export-clover-ids.ts
   ```

4. Commit and deploy

#### Modify a Category

| Change Type | Update Website | Update Clover | Run Export |
|-------------|----------------|---------------|------------|
| Name | Yes - menu-data.json | Yes - Dashboard | Yes (if name changed) |
| Sort Order | Yes - menu-data.json | Yes - Dashboard | No |

**Important:** If you change a category name in Clover, you MUST also change it in `menu-data.json` to match, then run the export script.

#### Delete a Category

1. **Reassign items:** Move all items to another category first
2. **In Clover Dashboard:** Delete the category
3. **In Website:** Remove from `menu-data.json`
4. **Update mappings:** Remove from `clover-mappings-production.json`
5. Commit and deploy

---

### MODIFIER GROUPS

#### Add a Modifier Group

1. Edit `src/data/menu-data.json`:
   ```json
   {
     "id": "new-modifier-group",
     "name": "New Options",
     "required": true,
     "minSelections": 1,
     "maxSelections": 2,
     "modifiers": [
       { "id": "option-1", "name": "Option 1", "price": 0 },
       { "id": "option-2", "name": "Option 2", "price": 1.50 }
     ]
   }
   ```

2. Link to items:
   ```json
   {
     "id": "some-item",
     "modifierGroups": [
       { "groupId": "new-modifier-group", "min": 1, "max": 2 }
     ]
   }
   ```

3. Run import script:
   ```bash
   npx tsx scripts/import-menu-to-clover.ts
   ```

4. Run export script:
   ```bash
   npx tsx scripts/export-clover-ids.ts
   ```

5. Commit and deploy

#### Modify a Modifier Group

| Change Type | Update Website | Update Clover | Run Export |
|-------------|----------------|---------------|------------|
| Group Name | Yes | Yes - Dashboard | Yes |
| Min/Max | Yes - menu-data.json | Yes - Run constraint script | No |
| Required | Yes - menu-data.json | Yes - Dashboard | No |

**To update min/max constraints:**
```bash
# Edit menu-data.json first, then:
npx tsx scripts/update-clover-modifier-constraints.ts
```

#### Delete a Modifier Group

1. **Remove from items:** Edit `menu-data.json` to remove the group from all items' `modifierGroups` arrays
2. **In Clover Dashboard:** Remove from items, then delete the modifier group
3. **In Website:** Remove from `menu-data.json` modifierGroups array
4. **Update mappings:** Remove from `clover-mappings-production.json`
5. Commit and deploy

---

### MODIFIERS (Individual Options)

#### Add a Modifier

1. Edit the modifier group in `src/data/menu-data.json`:
   ```json
   {
     "id": "sides-selection",
     "modifiers": [
       // existing modifiers...
       { "id": "new-side", "name": "New Side", "price": 2.99 }
     ]
   }
   ```

2. Run import script:
   ```bash
   npx tsx scripts/import-menu-to-clover.ts
   ```

3. Run export script:
   ```bash
   npx tsx scripts/export-clover-ids.ts
   ```

4. Commit and deploy

#### Modify a Modifier

| Change Type | Update Website | Update Clover | Run Export |
|-------------|----------------|---------------|------------|
| Name | Yes | Yes - Dashboard | Yes |
| Price | Yes | Yes - Dashboard or import | No |

#### Delete a Modifier

1. **In Clover Dashboard:** Delete the modifier from the group
2. **In Website:** Remove from `menu-data.json`
3. **Update mappings:** Remove the modifier's entry from `clover-mappings-production.json`
4. Commit and deploy

---

### MIN/MAX CONSTRAINTS ON MODIFIER GROUPS

The min/max constraints control how many selections a customer can make.

#### Update Min/Max

1. Edit `src/data/menu-data.json` - find the item and update its modifierGroups:
   ```json
   {
     "id": "gospel-plate",
     "modifierGroups": [
       { "groupId": "meat-selection", "min": 1, "max": 3 }
     ]
   }
   ```

2. Run the constraint update script:
   ```bash
   npx tsx scripts/update-clover-modifier-constraints.ts
   ```

3. Commit and deploy

**Note:** Min/Max can be different per item. The same modifier group can have `min: 1, max: 1` on one item and `min: 1, max: 3` on another.

---

## Scripts Reference

### Import Menu to Clover
```bash
npx tsx scripts/import-menu-to-clover.ts
```
- Creates/updates categories, modifier groups, modifiers, and items
- Links items to categories and modifier groups
- Safe to run multiple times (updates existing by name)

### Export Clover IDs
```bash
npx tsx scripts/export-clover-ids.ts
```
- Fetches all data from Clover
- Matches by name to local menu-data.json
- Updates clover-mappings-production.json

### Update Modifier Constraints
```bash
npx tsx scripts/update-clover-modifier-constraints.ts
```
- Updates min/max constraints on item-modifier group associations
- Required after changing min/max in menu-data.json

### Delete Clover Inventory (Use with Caution!)
```bash
npx tsx scripts/delete-clover-inventory.ts
```
- Deletes all items, categories, and modifier groups tracked in mappings
- Use only for complete reset

---

## Environment Setup

Scripts require these environment variables (in `.env.local`):

```bash
# Production
CLOVER_API_BASE_URL=https://api.clover.com
CLOVER_MERCHANT_ID=your_merchant_id
CLOVER_ACCESS_TOKEN=your_access_token

# For sandbox testing
# CLOVER_API_BASE_URL=https://sandbox.dev.clover.com
```

---

## Troubleshooting

### Item not appearing on website
1. Check `menu-data.json` has `"available": true`
2. Check Clover Dashboard: item should have `hidden: false` and `enableOnline: true`
3. Verify mapping exists in `clover-mappings-production.json`

### Order not appearing in Clover
1. Check browser console for errors
2. Check Netlify function logs
3. Verify `clover-mappings-production.json` has correct IDs

### Price mismatch
1. Update price in both `menu-data.json` AND Clover Dashboard
2. Website shows menu-data.json price
3. Clover shows its own price (for in-store orders)

### Modifier not selectable
1. Check item has the modifier group linked in `menu-data.json`
2. Check min/max allows selection
3. Run constraint update script if needed

---

## Quick Reference: Where to Make Changes

| What to Change | Primary Location | Secondary Location |
|----------------|------------------|-------------------|
| Item name/description | menu-data.json | Clover Dashboard |
| Item price | menu-data.json | Clover Dashboard |
| Item availability | menu-data.json | Clover Dashboard |
| Category structure | menu-data.json | Clover Dashboard |
| Modifier options | menu-data.json | Clover Dashboard |
| Modifier prices | menu-data.json | Clover Dashboard |
| Min/Max selections | menu-data.json | Run constraint script |
| Order types | Clover Dashboard only | N/A |
| Tax rates | Clover Dashboard only | N/A |
| Payment settings | Clover Dashboard only | N/A |

---

## Sync Checklist

Before deploying menu changes:

- [ ] Updated `menu-data.json`
- [ ] Ran import script (if adding new items)
- [ ] Ran export script (if IDs might have changed)
- [ ] Ran constraint script (if min/max changed)
- [ ] Verified in Clover Dashboard
- [ ] Committed changes to git
- [ ] Deployed to production
- [ ] Tested an order end-to-end

---

## Support

For technical issues with the sync process, check:
1. Netlify function logs for API errors
2. Browser console for frontend errors
3. Clover Dashboard for order/payment status
