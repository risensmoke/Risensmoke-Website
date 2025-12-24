/**
 * Clover Webhooks API
 * POST /api/clover/webhooks - Handle Clover webhook events
 * Uses Supabase for data storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { supabase } from '@/lib/supabase';
import type { CloverWebhookPayload, CloverWebhookEvent } from '@/types/clover';

const CLOVER_WEBHOOK_SECRET = process.env.CLOVER_WEBHOOK_SECRET;
const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;

/**
 * Verify webhook signature from Clover
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!CLOVER_WEBHOOK_SECRET || !signature) {
    console.warn('[Webhooks] Missing webhook secret or signature');
    return false;
  }

  const expectedSignature = createHmac('sha256', CLOVER_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

/**
 * Handle order events
 */
async function handleOrderEvent(event: CloverWebhookEvent): Promise<void> {
  const { type, objectId } = event;

  console.log(`[Webhooks] Processing order event: ${type} for ${objectId}`);

  // Find the local order by Clover order ID
  const { data: localOrder, error } = await supabase
    .from('orders')
    .select('*')
    .eq('clover_order_id', objectId)
    .single();

  if (error || !localOrder) {
    console.log(`[Webhooks] No local order found for Clover order ${objectId}`);
    return;
  }

  // Update order status based on event type
  switch (type) {
    case 'orders.updated':
      // Could fetch current state from Clover and update local status
      console.log(`[Webhooks] Order ${localOrder.order_number} updated in Clover`);
      break;

    case 'orders.deleted':
      // Mark local order as cancelled
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'CANCELLED' })
        .eq('id', localOrder.id);

      if (updateError) {
        console.error(`[Webhooks] Error cancelling order:`, updateError);
      } else {
        console.log(`[Webhooks] Order ${localOrder.order_number} cancelled`);
      }
      break;

    default:
      console.log(`[Webhooks] Unhandled order event type: ${type}`);
  }
}

/**
 * Handle payment events
 */
async function handlePaymentEvent(event: CloverWebhookEvent): Promise<void> {
  const { type, objectId } = event;

  console.log(`[Webhooks] Processing payment event: ${type} for ${objectId}`);

  // Payment events would be handled here
  // For example, updating order status when payment completes
}

/**
 * Handle item (menu) events
 */
async function handleItemEvent(event: CloverWebhookEvent): Promise<void> {
  const { type, objectId } = event;

  console.log(`[Webhooks] Processing item event: ${type} for ${objectId}`);

  // Item events indicate menu changes in Clover
  // Could trigger a menu sync or update specific item
  switch (type) {
    case 'items.created':
    case 'items.updated':
    case 'items.deleted':
      // Log that menu needs to be resynced
      console.log(`[Webhooks] Menu item changed: ${objectId}, consider resyncing`);
      break;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();

    // Verify signature
    const signature = request.headers.get('X-Clover-Auth');
    if (CLOVER_WEBHOOK_SECRET && !verifyWebhookSignature(rawBody, signature)) {
      console.error('[Webhooks] Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    const payload: CloverWebhookPayload = JSON.parse(rawBody);

    // Get events for our merchant
    const merchantEvents = CLOVER_MERCHANT_ID
      ? payload.merchants[CLOVER_MERCHANT_ID]
      : Object.values(payload.merchants)[0];

    if (!merchantEvents || merchantEvents.length === 0) {
      console.log('[Webhooks] No events for merchant');
      return NextResponse.json({ received: true });
    }

    // Process each event
    for (const event of merchantEvents) {
      try {
        if (event.type.startsWith('orders.')) {
          await handleOrderEvent(event);
        } else if (event.type.startsWith('payments.')) {
          await handlePaymentEvent(event);
        } else if (event.type.startsWith('items.')) {
          await handleItemEvent(event);
        } else {
          console.log(`[Webhooks] Unhandled event type: ${event.type}`);
        }
      } catch (eventError) {
        console.error(`[Webhooks] Error processing event ${event.type}:`, eventError);
        // Continue processing other events
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhooks] Error processing webhook:', error);

    // Still return 200 to prevent retries on parse errors
    return NextResponse.json({ received: true, error: 'Processing error' });
  }
}

// Clover uses GET to verify webhook URL during setup
export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' });
}
