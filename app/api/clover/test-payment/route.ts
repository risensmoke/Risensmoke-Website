/**
 * Test Payment API - For Sandbox Testing Only
 * POST /api/clover/test-payment - Process a test payment without database
 */

import { NextRequest, NextResponse } from 'next/server';
import { cloverService } from '@/lib/clover/service';
import type { OrderSubmissionData } from '@/types/clover';

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
    const { token, amount = 1.00 } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Payment token is required' },
        { status: 400 }
      );
    }

    // Create test order data
    const testOrderData: OrderSubmissionData = {
      customer: {
        firstName: 'Test',
        lastName: 'Customer',
        email: 'test@example.com',
        phone: '(555) 555-5555',
      },
      pickupDate: new Date().toISOString().split('T')[0],
      pickupTime: '12:00 PM',
      specialInstructions: 'TEST ORDER - Please ignore',
      items: [
        {
          menuItemId: 'test-item-1',
          name: 'Test Item - Sliced Brisket',
          basePrice: amount,
          quantity: 1,
          totalPrice: amount,
          modifiers: [],
        },
      ],
      subtotal: amount,
      tax: Math.round(amount * 0.08 * 100) / 100,
      total: Math.round(amount * 1.08 * 100) / 100,
    };

    const testOrderId = `test_${Date.now()}`;

    console.log('[Test Payment] Processing test payment...');
    console.log('[Test Payment] Amount:', testOrderData.total);
    console.log('[Test Payment] Token:', token.substring(0, 20) + '...');

    // Process payment and submit order
    const { cloverOrder, payment, printed } = await cloverService.submitOrderWithPayment(
      testOrderData,
      token,
      testOrderId
    );

    console.log('[Test Payment] Success!');
    console.log('[Test Payment] Clover Order ID:', cloverOrder.id);
    console.log('[Test Payment] Payment ID:', payment.id);

    return NextResponse.json({
      success: true,
      message: 'Test payment processed successfully',
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount / 100,
        last4: payment.source?.last4,
        brand: payment.source?.brand,
      },
      cloverOrder: {
        id: cloverOrder.id,
        total: cloverOrder.total / 100,
      },
      printed,
      orderTitle: `*** ONLINE ORDER - ${testOrderData.pickupTime} ***`,
    });
  } catch (error) {
    console.error('[Test Payment] Error:', error);

    return NextResponse.json(
      {
        error: 'Test payment failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
