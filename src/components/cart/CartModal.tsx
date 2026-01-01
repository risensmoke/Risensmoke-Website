'use client';

import { useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import Image from 'next/image';

export default function CartModal() {
  const {
    items,
    isOpen,
    toggleCart,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    tax,
    shippingCost,
    total,
    orderType
  } = useCartStore();

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        toggleCart();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, toggleCart]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-[100000]"
        onClick={toggleCart}
      />

      {/* Cart Modal */}
      <div
        className="fixed right-0 top-0 h-full w-96 max-w-full z-[100001] shadow-2xl"
        style={{ backgroundColor: '#2a2a2a' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className="flex items-center justify-between p-4"
            style={{
              borderBottom: '2px solid #FF6B35',
              backgroundColor: '#1C1C1C'
            }}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" style={{ color: '#FFD700' }} />
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#FFD700' }}>
                Your Cart ({items.length})
              </h2>
            </div>
            <button
              onClick={toggleCart}
              className="p-1 hover:opacity-80"
              style={{ color: '#F8F8F8' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart
                  className="w-16 h-16 mx-auto mb-4 opacity-30"
                  style={{ color: '#FF6B35' }}
                />
                <p className="text-base sm:text-lg mb-2" style={{ color: '#F8F8F8' }}>
                  Your cart is empty
                </p>
                <p className="text-xs sm:text-sm mb-6" style={{ color: '#999' }}>
                  Add some delicious BBQ to get started!
                </p>
                <Link
                  href="/order"
                  onClick={toggleCart}
                  className="inline-block px-6 py-3 rounded-lg font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B35, #D32F2F)',
                    color: '#F8F8F8'
                  }}
                >
                  Browse Menu
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg p-3"
                    style={{
                      backgroundColor: 'rgba(40, 40, 40, 0.8)',
                      border: '1px solid rgba(255, 107, 53, 0.2)'
                    }}
                  >
                    <div className="flex gap-3 mb-3">
                      {/* Thumbnail Image */}
                      {item.image && (
                        <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden" style={{ backgroundColor: '#2a2a2a' }}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain"
                            sizes="64px"
                          />
                        </div>
                      )}

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-sm sm:text-base font-semibold" style={{ color: '#FFD700' }}>
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-2 p-1 hover:opacity-80 flex-shrink-0"
                            style={{ color: '#D32F2F' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm" style={{ color: '#F8F8F8' }}>
                          ${item.basePrice.toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: 'rgba(255, 107, 53, 0.2)',
                            border: '1px solid #FF6B35'
                          }}
                        >
                          <Minus className="w-4 h-4" style={{ color: '#FF6B35' }} />
                        </button>
                        <span
                          className="font-semibold"
                          style={{ color: '#F8F8F8', minWidth: '2rem', textAlign: 'center' }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: 'rgba(255, 107, 53, 0.2)',
                            border: '1px solid #FF6B35'
                          }}
                        >
                          <Plus className="w-4 h-4" style={{ color: '#FF6B35' }} />
                        </button>
                      </div>
                      <span className="text-sm sm:text-base font-bold" style={{ color: '#FF6B35' }}>
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255, 107, 53, 0.1)' }}>
                        {item.modifiers.map((mod) => (
                          <p key={mod.id} className="text-sm" style={{ color: '#999' }}>
                            + {mod.name} (${mod.price.toFixed(2)})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Clear Cart Button */}
                <button
                  onClick={clearCart}
                  className="w-full py-2 rounded-lg text-sm font-semibold"
                  style={{
                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                    border: '1px solid #D32F2F',
                    color: '#D32F2F'
                  }}
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>

          {/* Footer with Totals */}
          {items.length > 0 && (
            <div
              className="p-4"
              style={{
                borderTop: '2px solid rgba(255, 107, 53, 0.3)',
                backgroundColor: '#1C1C1C'
              }}
            >
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span style={{ color: '#F8F8F8' }}>Subtotal</span>
                  <span style={{ color: '#F8F8F8' }}>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#F8F8F8' }}>Tax (8.25%)</span>
                  <span style={{ color: '#F8F8F8' }}>${tax.toFixed(2)}</span>
                </div>
                {orderType === 'shipping' && shippingCost > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: '#F8F8F8' }}>Shipping (FedEx 2-Day)</span>
                    <span style={{ color: '#F8F8F8' }}>${shippingCost.toFixed(2)}</span>
                  </div>
                )}
                <div
                  className="flex justify-between text-xl font-bold pt-2"
                  style={{ borderTop: '1px solid rgba(255, 107, 53, 0.2)' }}
                >
                  <span style={{ color: '#FFD700' }}>Total</span>
                  <span style={{ color: '#FFD700' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/order"
                onClick={toggleCart}
                className="block w-full py-3 rounded-lg font-bold text-center"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35, #D32F2F)',
                  color: '#F8F8F8'
                }}
              >
                Proceed to Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}