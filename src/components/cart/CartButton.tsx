'use client';

import { useCartStore } from '@/store/cartStore';
import { ShoppingCart } from 'lucide-react';

const CartButton = () => {
  const { items, toggleCart, total } = useCartStore();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <button
      onClick={toggleCart}
      className="relative flex items-center gap-2 px-4 py-2 text-smoke-white hover:text-ember-orange transition-colors duration-200"
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-fire-red text-smoke-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </div>
      {total > 0 && (
        <span className="hidden md:block font-semibold">
          ${total.toFixed(2)}
        </span>
      )}
    </button>
  );
};

export default CartButton;