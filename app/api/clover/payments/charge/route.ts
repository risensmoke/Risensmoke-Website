/**
 * Clover Payments API
 * POST /api/clover/payments/charge - Process payment with tokenized card
 * Uses Supabase for data storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { cloverService } from '@/lib/clover/service';
import { resolveCloverModId, isResolvableCategory } from '@/lib/clover/modifierResolver';
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
        modifiers: (item.modifiers || []).map((mod: { id?: string; cloverModId?: string; name: string; price: number; category?: string }) => ({
          id: mod.id || undefined,
          cloverModId: mod.cloverModId || undefined,
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

    // Re-resolve catalog modifiers server-side before submitting to Clover.
    // The cart snapshots cloverModId at add-to-cart time, client-side; if the
    // catalog wasn't loaded then (slow load, stale build, an old persisted
    // cart) the modifier is saved null, and if the Clover catalog was later
    // re-exported the saved id goes stale. Either way Clover drops the
    // modification and the side/meat vanishes from the kitchen ticket. Here we
    // resolve each catalog-backed modifier against the current committed
    // mappings, which is deterministic via itemModifierGroupMapping. This
    // patches both null and drifted ids regardless of how the cart was built.
    const patched: string[] = [];
    const unresolved: string[] = [];
    const resolutionDetails: {
      item: string;
      category: string | undefined;
      name: string;
      before: string | null;
      after: string | null;
      status: 'patched' | 'unresolved';
    }[] = [];
    for (const item of orderData.items) {
      for (const mod of item.modifiers) {
        if (!isResolvableCategory(mod.category)) continue;
        const resolved = resolveCloverModId(item.name, mod.category, mod.name);
        if (resolved) {
          if (resolved !== mod.cloverModId) {
            patched.push(`${item.name} -> ${mod.category}:${mod.name} (${mod.cloverModId || 'null'} => ${resolved})`);
            resolutionDetails.push({
              item: item.name, category: mod.category, name: mod.name,
              before: mod.cloverModId || null, after: resolved, status: 'patched',
            });
            mod.cloverModId = resolved;
          }
        } else if (!mod.cloverModId) {
          unresolved.push(`${item.name} -> ${mod.category}:${mod.name}`);
          resolutionDetails.push({
            item: item.name, category: mod.category, name: mod.name,
            before: null, after: null, status: 'unresolved',
          });
        }
      }
    }
    if (patched.length > 0) {
      console.warn(
        `[API/clover/payments/charge] Order ${localOrderId}: re-resolved ${patched.length} catalog modifier id(s) ` +
          `before submission: ${patched.join(', ')}`
      );
    }
    // Tripwire: anything still missing an id after re-resolution will be dropped
    // by Clover. With the resolver in place this should never fire; if it does,
    // the committed mappings are out of sync with the live catalog.
    if (unresolved.length > 0) {
      console.error(
        `[API/clover/payments/charge] Order ${localOrderId} has catalog modifiers that could not be resolved to a ` +
          `cloverModId; Clover will drop them: ${unresolved.join(', ')}`
      );
    }
    // Early-warning log: a row here means the cart arrived with missing/stale
    // modifier ids (the client-side capture failed) — the signal to analyze in
    // real time when the kitchen reports a bare ticket. Best-effort; never let a
    // logging failure block the payment.
    if (resolutionDetails.length > 0) {
      try {
        await supabase.from('modifier_resolution_log').insert({
          local_order_id: localOrderId,
          order_number: localOrder.order_number,
          customer_name: `${localOrder.customer_first_name} ${localOrder.customer_last_name}`,
          patched_count: patched.length,
          unresolved_count: unresolved.length,
          details: resolutionDetails,
        });
      } catch (logError) {
        console.error('[API/clover/payments/charge] Failed to write modifier_resolution_log:', logError);
      }
    }

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

    // Extract detailed error info
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'Unknown';
    const cloverError = (error as { cloverError?: unknown })?.cloverError;
    const statusCode = (error as { statusCode?: number })?.statusCode;

    // Check if this is a payment-related error (402 from Clover or contains payment keywords)
    const isPaymentError = statusCode === 402
      || errorMessage.includes('Payment failed')
      || errorMessage.includes('402')
      || errorName === 'CloverApiError';

    // Log full error details for debugging
    const errorDetails = {
      message: errorMessage,
      name: errorName,
      cloverError,
      statusCode,
    };
    console.error('[API/clover/payments/charge] Error details:', JSON.stringify(errorDetails, null, 2));

    // Extract user-friendly message from Clover error if available
    const cloverMessage = (cloverError as { message?: string; error?: { message?: string } })?.message
      || (cloverError as { error?: { message?: string } })?.error?.message;

    return NextResponse.json(
      {
        error: isPaymentError ? 'Payment failed' : 'Failed to process order',
        message: cloverMessage || errorMessage,
        details: errorDetails,
      },
      { status: isPaymentError ? 402 : 500 }
    );
  }
}
