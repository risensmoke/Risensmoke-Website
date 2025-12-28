/**
 * Clover Service Layer
 * Business logic for Clover operations
 */

import { cloverClient } from './client';
import type {
  CloverAtomicOrder,
  CloverLineItem,
  CloverOrder,
  CloverChargeResponse,
  LocalCartItem,
  OrderSubmissionData,
} from '@/types/clover';

// ============================================
// Order Mapping & Submission
// ============================================

/**
 * Format the order note for web orders with customer info
 */
function formatWebOrderNote(data: OrderSubmissionData): string {
  const lines = [
    '*** WEB ORDER ***',
    `Customer: ${data.customer.firstName} ${data.customer.lastName}`,
    `Phone: ${data.customer.phone}`,
    `Email: ${data.customer.email}`,
    `Pickup: ${data.pickupDate} at ${data.pickupTime}`,
  ];

  if (data.specialInstructions) {
    lines.push(`Notes: ${data.specialInstructions}`);
  }

  lines.push('***************');

  return lines.join('\n');
}

/**
 * Map a local cart item to Clover line item format
 */
function mapCartItemToLineItem(item: LocalCartItem): CloverLineItem {
  // Calculate item price in cents
  const unitPrice = Math.round(item.basePrice * 100);

  // Map modifiers
  const modifications = item.modifiers.map((mod) => ({
    modifier: mod.cloverModId ? { id: mod.cloverModId } : undefined,
    name: mod.name,
    amount: Math.round(mod.price * 100),
  }));

  return {
    item: item.cloverItemId ? { id: item.cloverItemId } : undefined,
    name: item.name,
    price: unitPrice,
    unitQty: item.quantity * 1000, // Clover uses 1000 units = 1 item
    printed: false,
    note: item.specialInstructions || undefined,
    modifications: modifications.length > 0 ? modifications : undefined,
  };
}

/**
 * Map cart data to Clover atomic order format
 */
export function mapCartToCloverOrder(data: OrderSubmissionData, customerId?: string): CloverAtomicOrder {
  const lineItems = data.items.map(mapCartItemToLineItem);

  return {
    orderCart: {
      lineItems,
      title: `*** ONLINE ORDER - ${data.pickupTime} ***`,
      note: formatWebOrderNote(data),
      customers: customerId ? [{ id: customerId }] : undefined,
    },
  };
}

/**
 * Submit order to Clover and trigger kitchen print
 */
export async function submitOrderToClover(
  data: OrderSubmissionData
): Promise<{ cloverOrder: CloverOrder; printed: boolean; customerId?: string }> {
  // Get or create customer in Clover
  let customerId: string | undefined;
  try {
    console.log('[CloverService] Creating/finding customer:', {
      firstName: data.customer.firstName,
      lastName: data.customer.lastName,
      email: data.customer.email,
      phone: data.customer.phone,
    });
    const customer = await cloverClient.getOrCreateCustomer({
      firstName: data.customer.firstName,
      lastName: data.customer.lastName,
      email: data.customer.email,
      phone: data.customer.phone,
    });
    customerId = customer.id;
    console.log('[CloverService] Customer created/found:', customerId);
  } catch (error) {
    console.error('[CloverService] Failed to create/find customer:', error);
    // Continue without customer - order will still be created
  }

  // Map cart to Clover order format (with customer if available)
  const atomicOrder = mapCartToCloverOrder(data, customerId);

  // Create the order in Clover
  const cloverOrder = await cloverClient.createAtomicOrder(atomicOrder);

  // Trigger kitchen print
  let printed = false;
  try {
    await cloverClient.triggerPrint(cloverOrder.id);
    printed = true;
  } catch (error) {
    console.error('[CloverService] Failed to trigger print:', error);
    // Don't fail the order if print fails
  }

  return { cloverOrder, printed, customerId };
}

/**
 * Process payment with Clover using tokenized card
 */
export async function processPayment(
  token: string,
  amountCents: number,
  taxAmountCents: number,
  localOrderId: string,
  cloverOrderId?: string,
  customerEmail?: string,
  description?: string
): Promise<CloverChargeResponse> {
  // Generate idempotency key from order ID
  const idempotencyKey = `order_${localOrderId}_${Date.now()}`;

  // Clover external_reference_id has max 12 chars - use last 12 chars of order ID
  const externalRefId = localOrderId.slice(-12);

  const chargeResponse = await cloverClient.createCharge(
    {
      source: token,
      amount: amountCents,
      tax_amount: taxAmountCents, // Include tax as separate line item
      currency: 'usd',
      capture: true,
      description: description || `Rise N' Smoke Web Order`,
      external_reference_id: externalRefId,
      receipt_email: customerEmail,
      ecomind: 'ecom',
      order_id: cloverOrderId, // Link payment to Clover order
    },
    idempotencyKey
  );

  return chargeResponse;
}

/**
 * Full order flow: create order, process payment, then print only if payment succeeds
 */
export async function submitOrderWithPayment(
  data: OrderSubmissionData,
  paymentToken: string,
  localOrderId: string
): Promise<{
  cloverOrder: CloverOrder;
  payment: CloverChargeResponse;
  printed: boolean;
}> {
  // Step 1: Create order in Clover (WITHOUT printing - we'll print only after payment succeeds)
  const { cloverOrder, customerId } = await createOrderWithoutPrint(data);

  // Step 2: Process payment with Clover order ID to link them
  const amountCents = Math.round(data.total * 100);
  const taxAmountCents = Math.round(data.tax * 100);

  let payment: CloverChargeResponse;
  try {
    payment = await processPayment(
      paymentToken,
      amountCents,
      taxAmountCents,
      localOrderId,
      cloverOrder.id,
      data.customer.email,
      `Rise N' Smoke Order #${localOrderId}`
    );
  } catch (error) {
    // Payment failed - delete the Clover order
    console.error('[CloverService] Payment failed, deleting order:', cloverOrder.id);
    try {
      await cloverClient.deleteOrder(cloverOrder.id);
    } catch (deleteError) {
      console.error('[CloverService] Failed to delete order after payment failure:', deleteError);
    }
    throw error;
  }

  // Verify payment succeeded
  if (payment.status !== 'succeeded') {
    // Payment declined - delete the Clover order
    console.error('[CloverService] Payment declined, deleting order:', cloverOrder.id);
    try {
      await cloverClient.deleteOrder(cloverOrder.id);
    } catch (deleteError) {
      console.error('[CloverService] Failed to delete order after payment decline:', deleteError);
    }
    throw new Error(`Payment failed: ${payment.failure_message || 'Unknown error'}`);
  }

  // Step 3: Payment succeeded - now trigger print
  let printed = false;
  try {
    await cloverClient.triggerPrint(cloverOrder.id);
    printed = true;
  } catch (error) {
    console.error('[CloverService] Failed to trigger print:', error);
    // Don't fail the order if print fails - payment already succeeded
  }

  return {
    cloverOrder,
    payment,
    printed,
  };
}

/**
 * Create order in Clover without triggering print
 */
async function createOrderWithoutPrint(
  data: OrderSubmissionData
): Promise<{ cloverOrder: CloverOrder; customerId?: string }> {
  // Get or create customer in Clover
  let customerId: string | undefined;
  try {
    console.log('[CloverService] Creating/finding customer:', {
      firstName: data.customer.firstName,
      lastName: data.customer.lastName,
      email: data.customer.email,
      phone: data.customer.phone,
    });
    const customer = await cloverClient.getOrCreateCustomer({
      firstName: data.customer.firstName,
      lastName: data.customer.lastName,
      email: data.customer.email,
      phone: data.customer.phone,
    });
    customerId = customer.id;
    console.log('[CloverService] Customer created/found:', customerId);
  } catch (error) {
    console.error('[CloverService] Failed to create/find customer:', error);
  }

  // Map cart to Clover order format
  const atomicOrder = mapCartToCloverOrder(data, customerId);

  // Create the order in Clover (no print trigger)
  const cloverOrder = await cloverClient.createAtomicOrder(atomicOrder);

  return { cloverOrder, customerId };
}

// ============================================
// Order Management
// ============================================

/**
 * Get order status from Clover
 */
export async function getOrderStatus(cloverOrderId: string): Promise<{
  state: string;
  paid: boolean;
  total: number;
}> {
  const order = await cloverClient.getOrder(cloverOrderId);

  const payments = order.payments?.elements || [];
  const paid = payments.some((p) => p.result === 'SUCCESS');

  return {
    state: order.state,
    paid,
    total: order.total / 100, // Convert from cents
  };
}

/**
 * Cancel an order in Clover
 */
export async function cancelOrder(cloverOrderId: string): Promise<void> {
  await cloverClient.deleteOrder(cloverOrderId);
}

// ============================================
// Export service
// ============================================

export const cloverService = {
  mapCartToCloverOrder,
  submitOrderToClover,
  processPayment,
  submitOrderWithPayment,
  getOrderStatus,
  cancelOrder,
};
