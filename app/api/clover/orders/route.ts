/**
 * Clover Orders API
 * POST /api/clover/orders - Submit order to Clover POS
 * Uses Supabase for data storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { cloverService } from '@/lib/clover/service';
import type { OrderSubmissionData } from '@/types/clover';

// Validation schema
const submitToCloverSchema = z.object({
  localOrderId: z.string().min(1, 'Local order ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const parseResult = submitToCloverSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { localOrderId } = parseResult.data;

    // Fetch the local order
    const { data: localOrder, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', localOrderId)
      .single();

    if (orderError || !localOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if already submitted to Clover
    if (localOrder.clover_order_id) {
      return NextResponse.json(
        { error: 'Order already submitted to Clover' },
        { status: 400 }
      );
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', localOrderId);

    if (itemsError) {
      console.error('[API/clover/orders] Error fetching order items:', itemsError);
    }

    // Parse pickup time for formatting
    const pickupTime = new Date(localOrder.pickup_time);

    // Map to order submission data
    const orderData: OrderSubmissionData = {
      customer: {
        firstName: localOrder.customer_first_name,
        lastName: localOrder.customer_last_name,
        email: localOrder.customer_email,
        phone: localOrder.customer_phone,
      },
      pickupDate: pickupTime.toISOString().split('T')[0],
      pickupTime: pickupTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      specialInstructions: localOrder.special_instructions || undefined,
      items: (items || []).map((item) => ({
        menuItemId: undefined,
        cloverItemId: undefined,
        name: item.item_name,
        basePrice: item.base_price,
        quantity: item.quantity,
        totalPrice: item.total_price,
        modifiers: (item.modifiers || []).map((mod: { name: string; price: number; category?: string }) => ({
          id: undefined,
          cloverModId: undefined,
          name: mod.name,
          price: mod.price,
          category: mod.category || 'Modifier',
        })),
        specialInstructions: item.special_instructions || undefined,
      })),
      subtotal: localOrder.subtotal,
      tax: localOrder.tax,
      total: localOrder.total,
    };

    // Submit to Clover
    const { cloverOrder, printed } = await cloverService.submitOrderToClover(orderData);

    // Update local order with Clover order ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({ clover_order_id: cloverOrder.id })
      .eq('id', localOrderId);

    if (updateError) {
      console.error('[API/clover/orders] Error updating order with Clover ID:', updateError);
    }

    return NextResponse.json({
      success: true,
      cloverOrderId: cloverOrder.id,
      printed,
      message: 'Order submitted to Clover successfully',
    });
  } catch (error) {
    console.error('[API/clover/orders] Error submitting order to Clover:', error);

    return NextResponse.json(
      {
        error: 'Failed to submit order to Clover',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cloverOrderId = searchParams.get('cloverOrderId');

  if (!cloverOrderId) {
    return NextResponse.json(
      { error: 'Clover order ID is required' },
      { status: 400 }
    );
  }

  try {
    const status = await cloverService.getOrderStatus(cloverOrderId);

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('[API/clover/orders] Error fetching Clover order:', error);

    return NextResponse.json(
      { error: 'Failed to fetch Clover order status' },
      { status: 500 }
    );
  }
}
