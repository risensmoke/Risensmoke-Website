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
 * Creates separate line items for each quantity (qty 2 = 2 line items)
 * This ensures proper display on receipts instead of combined pricing
 */
function mapCartItemToLineItems(item: LocalCartItem): CloverLineItem[] {
  // Calculate item price in cents
  const unitPrice = Math.round(item.basePrice * 100);

  // Map modifiers
  const modifications = item.modifiers.map((mod) => ({
    modifier: mod.cloverModId ? { id: mod.cloverModId } : undefined,
    name: mod.name,
    amount: Math.round(mod.price * 100),
  }));

  // Create separate line items for each quantity
  const lineItems: CloverLineItem[] = [];
  for (let i = 0; i < item.quantity; i++) {
    lineItems.push({
      item: item.cloverItemId ? { id: item.cloverItemId } : undefined,
      name: item.name,
      price: unitPrice,
      unitQty: 1000, // 1000 = 1 unit in Clover
      printed: false,
      note: item.specialInstructions || undefined,
      modifications: modifications.length > 0 ? modifications : undefined,
    });
  }

  return lineItems;
}

// Order type ID for web orders (from Clover Dashboard)
const CLOVER_WEB_ORDER_TYPE_ID = process.env.CLOVER_WEB_ORDER_TYPE_ID;

/**
 * Map cart data to Clover atomic order format
 */
export function mapCartToCloverOrder(data: OrderSubmissionData, customerId?: string): CloverAtomicOrder {
  // Flatten line items (each quantity becomes a separate line item)
  const lineItems = data.items.flatMap(mapCartItemToLineItems);

  return {
    orderCart: {
      lineItems,
      title: `*** ONLINE ORDER - ${data.pickupDate} ${data.pickupTime} ***`,
      note: formatWebOrderNote(data),
      orderType: CLOVER_WEB_ORDER_TYPE_ID ? { id: CLOVER_WEB_ORDER_TYPE_ID } : undefined,
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
 * Process payment for an existing Clover order using tokenized card
 * Uses /v1/orders/{orderId}/pay to link payment to order's line items
 */
export async function processPayment(
  token: string,
  localOrderId: string,
  cloverOrderId: string,
  totalAmountCents: number,
  taxAmountCents: number,
  customerEmail?: string
): Promise<CloverChargeResponse> {
  // Generate idempotency key from order ID
  const idempotencyKey = `order_${localOrderId}_${Date.now()}`;

  // Use payForOrder with tax_amount to properly record tax in Clover
  const payRequest = {
    source: token,
    email: customerEmail,
    ecomind: 'ecom' as const,
    tax_amount: taxAmountCents, // Send tax amount so it shows in Clover's tax field
  };

  console.log('[CloverService] Paying for order:', cloverOrderId, JSON.stringify(payRequest, null, 2));

  const paymentResponse = await cloverClient.payForOrder(
    cloverOrderId,
    payRequest,
    idempotencyKey
  );

  return paymentResponse;
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

  // Step 2: Process payment for the Clover order
  // Calculate amounts in cents from the order data
  const totalAmountCents = Math.round(data.total * 100);
  const taxAmountCents = Math.round(data.tax * 100);

  let payment: CloverChargeResponse;
  try {
    payment = await processPayment(
      paymentToken,
      localOrderId,
      cloverOrder.id,
      totalAmountCents,
      taxAmountCents,
      data.customer.email
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
  // Note: /v1/charges returns status: 'succeeded', but /v1/orders/{id}/pay returns status: 'paid'
  const isPaymentSuccessful = payment.status === 'succeeded' || payment.status === 'paid' || payment.paid === true;
  if (!isPaymentSuccessful) {
    // Payment declined - delete the Clover order
    console.error('[CloverService] Payment declined, deleting order:', cloverOrder.id, 'status:', payment.status);
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
  // Clover will calculate tax at 8.25% (matching our website rate)
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
