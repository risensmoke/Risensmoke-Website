/**
 * Menu Export API
 * POST /api/clover/menu/export - Export website menu to Clover POS
 */

import { NextRequest, NextResponse } from 'next/server';
import { menuExportService } from '@/lib/clover/menuExport';

// Simple admin check
const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization
    const authHeader = request.headers.get('Authorization');
    if (ADMIN_SECRET && authHeader !== `Bearer ${ADMIN_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Export] Starting menu export to Clover...');

    // Run the export
    const result = await menuExportService.exportMenuToClover();

    console.log('[Export] Export completed:', {
      success: result.success,
      itemsCreated: result.itemsCreated,
      categoriesCreated: result.categoriesCreated,
      modifierGroupsCreated: result.modifierGroupsCreated,
      errorCount: result.errors.length,
    });

    return NextResponse.json({
      success: result.success,
      environment: result.environment,
      itemsCreated: result.itemsCreated,
      categoriesCreated: result.categoriesCreated,
      modifierGroupsCreated: result.modifierGroupsCreated,
      modifiersCreated: result.modifiersCreated,
      errors: result.errors.length > 0 ? result.errors : undefined,
      mappingsFile: result.mappingsFile,
    });
  } catch (error) {
    console.error('[API/clover/menu/export] Error exporting menu:', error);

    return NextResponse.json(
      {
        error: 'Failed to export menu',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
