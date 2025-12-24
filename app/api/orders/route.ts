/**
 * Local Orders API
 * POST /api/orders - Create a new local order
 * Uses Supabase for data storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

// Validation schema for order creation
const orderItemModifierSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  price: z.number(),
  category: z.string().optional(),
});

const orderItemSchema = z.object({
  menuItemId: z.string().optional(),
  name: z.string(),
  basePrice: z.number(),
  quantity: z.number().int().positive(),
  modifiers: z.array(orderItemModifierSchema),
  specialInstructions: z.string().optional(),
  totalPrice: z.number(),
});

const createOrderSchema = z.object({
  customer: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
  }),
  pickupDate: z.string(),
  pickupTime: z.string(),
  specialInstructions: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
});

/**
 * Generate a unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `RSB${timestamp}${random}`;
}

/**
 * Parse pickup date and time into a Date object
 */
function parsePickupDateTime(dateStr: string, timeStr: string): Date {
  // timeStr is like "11:00 AM" or "2:30 PM"
  const [timePart, period] = timeStr.split(' ');
  const [hours, minutes] = timePart.split(':').map(Number);

  let hour24 = hours;
  if (period === 'PM' && hours !== 12) {
    hour24 = hours + 12;
  } else if (period === 'AM' && hours === 12) {
    hour24 = 0;
  }

  const date = new Date(dateStr);
  date.setHours(hour24, minutes, 0, 0);

  return date;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parseResult = createOrderSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Parse pickup time
    const pickupTime = parsePickupDateTime(data.pickupDate, data.pickupTime);
    const estimatedReady = new Date(pickupTime.getTime() - 15 * 60 * 1000); // 15 minutes before pickup

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_first_name: data.customer.firstName,
        customer_last_name: data.customer.lastName,
        customer_email: data.customer.email,
        customer_phone: data.customer.phone,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
        pickup_time: pickupTime.toISOString(),
        estimated_ready: estimatedReady.toISOString(),
        special_instructions: data.specialInstructions || null,
        status: 'CONFIRMED',
      })
      .select()
      .single();

    if (orderError) {
      console.error('[API/orders] Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', message: orderError.message },
        { status: 500 }
      );
    }

    // Create order items with modifiers stored as JSONB
    const orderItems = data.items.map((item) => ({
      order_id: order.id,
      item_name: item.name,
      quantity: item.quantity,
      base_price: item.basePrice,
      total_price: item.totalPrice,
      special_instructions: item.specialInstructions || null,
      modifiers: item.modifiers.map((mod) => ({
        name: mod.name,
        price: mod.price,
        category: mod.category || null,
      })),
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('[API/orders] Error creating order items:', itemsError);
      // Delete the order if items failed to create
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to create order items', message: itemsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        total: order.total,
        pickupTime: order.pickup_time,
        estimatedReady: order.estimated_ready,
      },
    });
  } catch (error) {
    console.error('[API/orders] Error creating order:', error);

    return NextResponse.json(
      {
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderNumber = searchParams.get('orderNumber');

  if (!orderNumber) {
    return NextResponse.json(
      { error: 'Order number is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    if (itemsError) {
      console.error('[API/orders] Error fetching order items:', itemsError);
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.order_number,
        customerFirstName: order.customer_first_name,
        customerLastName: order.customer_last_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        pickupTime: order.pickup_time,
        estimatedReady: order.estimated_ready,
        status: order.status,
        specialInstructions: order.special_instructions,
        createdAt: order.created_at,
        items: items?.map((item) => ({
          id: item.id,
          itemName: item.item_name,
          quantity: item.quantity,
          basePrice: item.base_price,
          totalPrice: item.total_price,
          specialInstructions: item.special_instructions,
          modifiers: item.modifiers,
        })) || [],
      },
    });
  } catch (error) {
    console.error('[API/orders] Error fetching order:', error);

    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
