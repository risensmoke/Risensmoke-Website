/**
 * Supabase Client Configuration
 * Used for all database operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Single client instance for all operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface DbUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface DbOrder {
  id: string;
  order_number: string;
  clover_order_id: string | null;
  user_id: string | null;
  customer_email: string;
  customer_phone: string;
  customer_first_name: string;
  customer_last_name: string;
  subtotal: number;
  tax: number;
  total: number;
  pickup_time: string;
  estimated_ready: string;
  status: 'CONFIRMED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'CANCELLED';
  payment_intent_id: string | null;
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  item_name: string;
  quantity: number;
  base_price: number;
  total_price: number;
  special_instructions: string | null;
  modifiers: object; // JSON array of modifiers
}
