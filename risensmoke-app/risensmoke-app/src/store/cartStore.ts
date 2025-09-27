import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  modifiers: CartModifier[];
  specialInstructions?: string;
  totalPrice: number;
}

interface CartModifier {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  pickupTime?: Date;
  estimatedReady?: Date;
  isOpen: boolean;
}

interface CartActions {
  addItem: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateModifiers: (itemId: string, modifiers: CartModifier[]) => void;
  clearCart: () => void;
  setPickupTime: (time: Date) => void;
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
      total: 0,
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
          total: 0,
          pickupTime: undefined,
          estimatedReady: undefined
        });
      },

      setPickupTime: (time) => {
        set({ pickupTime: time });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      calculateTotals: () => {
        const state = get();
        const subtotal = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
        const tax = subtotal * TAX_RATE;
        const total = subtotal + tax;

        set({ subtotal, tax, total });
      }
    }),
    {
      name: 'rise-n-smoke-cart',
      partialize: (state) => ({
        items: state.items,
        pickupTime: state.pickupTime,
        subtotal: state.subtotal,
        tax: state.tax,
        total: state.total
      })
    }
  )
);