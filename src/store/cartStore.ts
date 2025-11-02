import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateShippingCost } from '@/lib/shipping';

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  modifiers: CartModifier[];
  specialInstructions?: string;
  totalPrice: number;
  image?: string;
}

interface CartModifier {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  orderType: 'pickup' | 'shipping';
  pickupTime?: Date;
  estimatedReady?: Date;
  shippingAddress?: ShippingAddress;
  isOpen: boolean;
}

interface CartActions {
  addItem: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateModifiers: (itemId: string, modifiers: CartModifier[]) => void;
  clearCart: () => void;
  setPickupTime: (time: Date) => void;
  setOrderType: (type: 'pickup' | 'shipping') => void;
  setShippingAddress: (address: ShippingAddress) => void;
  toggleCart: () => void;
  calculateTotals: () => void;
}

const TAX_RATE = 0.08; // 8% Texas sales tax

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      tax: 0,
      shippingCost: 0,
      total: 0,
      orderType: 'pickup',
      isOpen: false,

      addItem: (item) => {
        const id = `${item.menuItemId}-${Date.now()}-${Math.random()}`;
        const totalPrice = item.basePrice + item.modifiers.reduce((sum, mod) => sum + mod.price, 0);

        set((state) => ({
          items: [...state.items, { ...item, id, totalPrice: totalPrice * item.quantity }]
        }));
        get().calculateTotals();
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId)
        }));
        get().calculateTotals();
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  quantity,
                  totalPrice: (item.basePrice + item.modifiers.reduce((sum, mod) => sum + mod.price, 0)) * quantity
                }
              : item
          )
        }));
        get().calculateTotals();
      },

      updateModifiers: (itemId, modifiers) => {
        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  modifiers,
                  totalPrice: (item.basePrice + modifiers.reduce((sum, mod) => sum + mod.price, 0)) * item.quantity
                }
              : item
          )
        }));
        get().calculateTotals();
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          tax: 0,
          shippingCost: 0,
          total: 0,
          orderType: 'pickup',
          pickupTime: undefined,
          estimatedReady: undefined,
          shippingAddress: undefined
        });
      },

      setPickupTime: (time) => {
        set({ pickupTime: time });
      },

      setOrderType: (type) => {
        set({ orderType: type });
        get().calculateTotals();
      },

      setShippingAddress: (address) => {
        set({ shippingAddress: address });
        get().calculateTotals();
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      calculateTotals: () => {
        const state = get();
        const subtotal = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
        const tax = subtotal * TAX_RATE;

        // Calculate shipping cost if order type is shipping
        let shippingCost = 0;
        if (state.orderType === 'shipping' && state.shippingAddress?.state) {
          const shippingInfo = calculateShippingCost(state.shippingAddress.state);
          shippingCost = shippingInfo?.totalShipping || 0;
        }

        const total = subtotal + tax + shippingCost;

        set({ subtotal, tax, shippingCost, total });
      }
    }),
    {
      name: 'rise-n-smoke-cart',
      partialize: (state) => ({
        items: state.items,
        orderType: state.orderType,
        pickupTime: state.pickupTime,
        shippingAddress: state.shippingAddress,
        subtotal: state.subtotal,
        tax: state.tax,
        shippingCost: state.shippingCost,
        total: state.total
      })
    }
  )
);