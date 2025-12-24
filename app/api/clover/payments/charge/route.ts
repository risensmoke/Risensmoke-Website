/**
 * Clover Payments API
 * POST /api/clover/payments/charge - Process payment with tokenized card
 * Uses Supabase for data storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { cloverService } from '@/lib/clover/service';
import type { OrderSubmissionData } from '@/types/clover';

// Validation schema
const chargeSchema = z.object({
  localOrderId: z.string().min(1, 'Order ID is required'),
  token: z.string().min(1, 'Payment token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const parseResult = chargeSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { localOrderId, token } = parseResult.data;

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

    // Check if already paid
    if (localOrder.payment_intent_id) {
      return NextResponse.json(
        { error: 'Order already paid' },
        { status: 400 }
      );
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', localOrderId);

    if (itemsError) {
      console.error('[API/clover/payments/charge] Error fetching order items:', itemsError);
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

    // Process payment and submit order to Clover
    const { cloverOrder, payment, printed } = await cloverService.submitOrderWithPayment(
      orderData,
      token,
      localOrderId
    );

    // Update local order with payment and Clover order info
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        clover_order_id: cloverOrder.id,
        payment_intent_id: payment.id,
        status: 'CONFIRMED',
      })
      .eq('id', localOrderId);

    if (updateError) {
      console.error('[API/clover/payments/charge] Error updating order:', updateError);
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount / 100, // Convert from cents
        last4: payment.source?.last4,
        brand: payment.source?.brand,
      },
      cloverOrderId: cloverOrder.id,
      printed,
      message: 'Payment processed and order submitted successfully',
    });
  } catch (error) {
    console.error('[API/clover/payments/charge] Error processing payment:', error);

    // Determine if it's a payment-specific error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isPaymentError = errorMessage.includes('Payment failed');

    return NextResponse.json(
      {
        error: isPaymentError ? 'Payment failed' : 'Failed to process order',
        message: errorMessage,
      },
      { status: isPaymentError ? 402 : 500 }
    );
  }
}
