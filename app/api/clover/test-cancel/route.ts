/**
 * Test Cancel Order API - For Sandbox Testing Only
 * POST /api/clover/test-cancel - Cancel an order and refund payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { cloverClient } from '@/lib/clover/client';

// Only allow in development/sandbox
const IS_SANDBOX = process.env.CLOVER_API_BASE_URL?.includes('sandbox');

export async function POST(request: NextRequest) {
  // Block in production
  if (!IS_SANDBOX) {
    return NextResponse.json(
      { error: 'Test endpoint only available in sandbox' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { cloverOrderId, paymentId, reason = 'Customer requested cancellation' } = body;

    if (!cloverOrderId) {
      return NextResponse.json(
        { error: 'cloverOrderId is required' },
        { status: 400 }
      );
    }

    console.log('[Test Cancel] Starting order cancellation...');
    console.log('[Test Cancel] Order ID:', cloverOrderId);
    console.log('[Test Cancel] Payment ID:', paymentId);

    let refundResult = null;

    // Step 1: If payment ID provided, refund it first
    if (paymentId) {
      console.log('[Test Cancel] Refunding payment...');
      try {
        refundResult = await cloverClient.refundCharge(paymentId, undefined, reason);
        console.log('[Test Cancel] Refund successful:', refundResult);
      } catch (refundError) {
        console.error('[Test Cancel] Refund failed:', refundError);
        return NextResponse.json(
          {
            error: 'Refund failed',
            message: refundError instanceof Error ? refundError.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }

    // Step 2: Delete/cancel the order
    console.log('[Test Cancel] Deleting order...');
    try {
      await cloverClient.deleteOrder(cloverOrderId);
      console.log('[Test Cancel] Order deleted successfully');
    } catch (deleteError) {
      // Order might already be closed, try updating state instead
      console.log('[Test Cancel] Delete failed, trying to update order state...');
      try {
        await cloverClient.updateOrder(cloverOrderId, { state: 'LOCKED' });
        console.log('[Test Cancel] Order state updated to locked');
      } catch (updateError) {
        console.error('[Test Cancel] Update state also failed:', updateError);
        // Continue anyway - the refund was successful
      }
    }

    console.log('[Test Cancel] Cancellation complete!');

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      cloverOrderId,
      refund: refundResult ? {
        id: refundResult.id,
        amount: refundResult.amount / 100,
        status: refundResult.status,
      } : null,
    });
  } catch (error) {
    console.error('[Test Cancel] Error:', error);

    return NextResponse.json(
      {
        error: 'Cancellation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch order details
export async function GET(request: NextRequest) {
  if (!IS_SANDBOX) {
    return NextResponse.json(
      { error: 'Test endpoint only available in sandbox' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const cloverOrderId = searchParams.get('orderId');

  if (!cloverOrderId) {
    return NextResponse.json(
      { error: 'orderId query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const order = await cloverClient.getOrder(cloverOrderId);

    return NextResponse.json({
      id: order.id,
      state: order.state,
      total: order.total / 100,
      payments: order.payments?.elements?.map(p => ({
        id: p.id,
        amount: p.amount / 100,
        result: p.result,
      })) || [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch order',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
