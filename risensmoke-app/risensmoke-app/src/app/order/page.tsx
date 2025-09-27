'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingCart, Clock, Plus, Minus, X, Calendar } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

const menuCategories = [
  'All',
  'Meats',
  'Sandwiches',
  'Sides',
  'Desserts',
  'Beverages'
];

const menuItems: MenuItem[] = [
  // Meats
  {
    id: 'brisket',
    name: 'Heavenly Brisket',
    description: '12-hour smoked USDA Prime brisket with our signature bark',
    price: 24.99,
    category: 'Meats',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'ribs',
    name: 'Sacred Ribs',
    description: 'St. Louis cut ribs with our holy glaze',
    price: 22.99,
    category: 'Meats',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'pulled-pork',
    name: 'Blessed Pulled Pork',
    description: 'Slow-smoked shoulder, hand-pulled and seasoned',
    price: 18.99,
    category: 'Meats',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'chicken',
    name: 'Smoked Half Chicken',
    description: 'Brined and smoked to juicy perfection',
    price: 16.99,
    category: 'Meats',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'sausage',
    name: 'Texas Hot Links',
    description: 'Spicy smoked sausage with a perfect snap',
    price: 14.99,
    category: 'Meats',
    image: '/Food_Image.jpg',
    available: true
  },

  // Sandwiches
  {
    id: 'brisket-sandwich',
    name: 'Brisket Sandwich',
    description: 'Sliced brisket on a brioche bun with pickles and onions',
    price: 12.99,
    category: 'Sandwiches',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'pulled-pork-sandwich',
    name: 'Pulled Pork Sandwich',
    description: 'Pulled pork with coleslaw on a brioche bun',
    price: 10.99,
    category: 'Sandwiches',
    image: '/Food_Image.jpg',
    available: true
  },

  // Sides
  {
    id: 'mac-cheese',
    name: 'Smoked Mac & Cheese',
    description: 'Three-cheese blend with a crispy top',
    price: 6.99,
    category: 'Sides',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'coleslaw',
    name: 'Tangy Coleslaw',
    description: 'Fresh and crispy with our house dressing',
    price: 4.99,
    category: 'Sides',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'beans',
    name: 'Smoky Baked Beans',
    description: 'Slow-cooked with brisket chunks',
    price: 5.99,
    category: 'Sides',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'cornbread',
    name: 'Honey Cornbread',
    description: 'Sweet and moist, served warm',
    price: 3.99,
    category: 'Sides',
    image: '/Food_Image.jpg',
    available: true
  },

  // Desserts
  {
    id: 'pecan-pie',
    name: 'Texas Pecan Pie',
    description: 'Classic pecan pie with whipped cream',
    price: 7.99,
    category: 'Desserts',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'banana-pudding',
    name: 'Banana Pudding',
    description: 'Homemade with vanilla wafers',
    price: 6.99,
    category: 'Desserts',
    image: '/Food_Image.jpg',
    available: true
  },

  // Beverages
  {
    id: 'sweet-tea',
    name: 'Sweet Tea',
    description: 'House-made Southern sweet tea',
    price: 2.99,
    category: 'Beverages',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'lemonade',
    name: 'Fresh Lemonade',
    description: 'Hand-squeezed daily',
    price: 3.49,
    category: 'Beverages',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'soda',
    name: 'Soft Drinks',
    description: 'Coke, Sprite, Dr Pepper, Orange',
    price: 2.49,
    category: 'Beverages',
    image: '/Food_Image.jpg',
    available: true
  }
];

export default function OrderPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>({});

  const { items, addItem, removeItem, updateQuantity, subtotal, tax, total } = useCartStore();

  useEffect(() => {
    // Set default pickup date to today
    const today = new Date().toISOString().split('T')[0];
    setPickupDate(today);
  }, []);

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const handleAddToCart = (item: MenuItem) => {
    const quantity = itemQuantities[item.id] || 1;
    addItem({
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      quantity: quantity,
      modifiers: []
    });
    setItemQuantities({ ...itemQuantities, [item.id]: 1 });
  };

  const updateItemQuantity = (itemId: string, delta: number) => {
    const currentQty = itemQuantities[itemId] || 1;
    const newQty = Math.max(1, currentQty + delta);
    setItemQuantities({ ...itemQuantities, [itemId]: newQty });
  };

  const getItemQuantityInCart = (itemId: string) => {
    return items.filter(item => item.menuItemId === itemId).reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="min-h-screen py-20" style={{ backgroundColor: '#1C1C1C' }}>
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl md:text-5xl lg:text-hero mb-4"
            style={{
              fontFamily: "'Rye', serif",
              background: 'linear-gradient(135deg, #FF6B35, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(255, 107, 53, 0.5)'
            }}
          >
            ORDER ONLINE
          </h1>
          <p className="text-lg" style={{ color: '#F8F8F8' }}>
            Order ahead for pickup - Skip the line!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="mb-6 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {menuCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="px-4 py-2 rounded-lg font-semibold transition-all"
                    style={{
                      backgroundColor: selectedCategory === category ? '#FF6B35' : 'rgba(40, 40, 40, 0.8)',
                      color: '#F8F8F8',
                      border: '2px solid rgba(255, 107, 53, 0.3)'
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(40, 40, 40, 0.8)',
                    border: '2px solid rgba(255, 107, 53, 0.3)'
                  }}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-32 h-32 relative">
                      <Image
                        src={item.image || '/Food_Image.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold" style={{ color: '#FFD700' }}>
                          {item.name}
                        </h3>
                        <span className="text-xl font-bold" style={{ color: '#FF6B35' }}>
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm mb-3" style={{ color: '#F8F8F8' }}>
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateItemQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: 'rgba(255, 107, 53, 0.2)',
                              border: '1px solid #FF6B35'
                            }}
                          >
                            <Minus className="w-4 h-4" style={{ color: '#FF6B35' }} />
                          </button>
                          <span style={{ color: '#F8F8F8', minWidth: '2rem', textAlign: 'center' }}>
                            {itemQuantities[item.id] || 1}
                          </span>
                          <button
                            onClick={() => updateItemQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: 'rgba(255, 107, 53, 0.2)',
                              border: '1px solid #FF6B35'
                            }}
                          >
                            <Plus className="w-4 h-4" style={{ color: '#FF6B35' }} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          {getItemQuantityInCart(item.id) > 0 && (
                            <span className="text-sm" style={{ color: '#FFD700' }}>
                              ({getItemQuantityInCart(item.id)} in cart)
                            </span>
                          )}
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                            style={{
                              background: 'linear-gradient(135deg, #FF6B35, #D32F2F)',
                              color: '#F8F8F8'
                            }}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24 rounded-lg p-6"
              style={{
                backgroundColor: 'rgba(40, 40, 40, 0.9)',
                border: '2px solid rgba(255, 107, 53, 0.3)'
              }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#FFD700' }}>
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.length === 0 ? (
                  <p style={{ color: '#F8F8F8' }}>Your cart is empty</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold" style={{ color: '#F8F8F8' }}>
                          {item.name}
                        </p>
                        <p className="text-sm" style={{ color: '#FF6B35' }}>
                          Qty: {item.quantity} × ${item.basePrice.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-2"
                        style={{ color: '#D32F2F' }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Pickup Time */}
              <div className="mb-6">
                <label className="block mb-2 font-semibold" style={{ color: '#FFD700' }}>
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Pickup Date & Time
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 rounded mb-2"
                  style={{
                    backgroundColor: 'rgba(30, 30, 30, 0.8)',
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                    color: '#F8F8F8'
                  }}
                />
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-3 py-2 rounded"
                  style={{
                    backgroundColor: 'rgba(30, 30, 30, 0.8)',
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                    color: '#F8F8F8'
                  }}
                >
                  <option value="">Select pickup time</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="12:30">12:30 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="13:30">1:30 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="14:30">2:30 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="15:30">3:30 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="16:30">4:30 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="17:30">5:30 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="18:30">6:30 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="19:30">7:30 PM</option>
                </select>
              </div>

              {/* Special Instructions */}
              <div className="mb-6">
                <label className="block mb-2 font-semibold" style={{ color: '#FFD700' }}>
                  Special Instructions
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                  placeholder="Any special requests?"
                  className="w-full px-3 py-2 rounded resize-none"
                  style={{
                    backgroundColor: 'rgba(30, 30, 30, 0.8)',
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                    color: '#F8F8F8'
                  }}
                />
              </div>

              {/* Totals */}
              <div className="border-t pt-4" style={{ borderColor: 'rgba(255, 107, 53, 0.3)' }}>
                <div className="flex justify-between mb-2">
                  <span style={{ color: '#F8F8F8' }}>Subtotal</span>
                  <span style={{ color: '#F8F8F8' }}>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span style={{ color: '#F8F8F8' }}>Tax</span>
                  <span style={{ color: '#F8F8F8' }}>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4 text-xl font-bold">
                  <span style={{ color: '#FFD700' }}>Total</span>
                  <span style={{ color: '#FFD700' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                className="w-full py-3 rounded-lg font-bold text-lg"
                style={{
                  background: items.length > 0 && pickupTime
                    ? 'linear-gradient(135deg, #FF6B35, #D32F2F)'
                    : 'rgba(100, 100, 100, 0.5)',
                  color: '#F8F8F8',
                  cursor: items.length > 0 && pickupTime ? 'pointer' : 'not-allowed'
                }}
                disabled={items.length === 0 || !pickupTime}
              >
                {items.length === 0 ? 'Add Items to Cart' : !pickupTime ? 'Select Pickup Time' : 'Proceed to Checkout'}
              </button>

              {/* Estimated Ready Time */}
              {pickupTime && (
                <div className="mt-4 text-center">
                  <Clock className="inline w-4 h-4 mr-1" style={{ color: '#FF6B35' }} />
                  <span className="text-sm" style={{ color: '#F8F8F8' }}>
                    Estimated ready by {pickupTime}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}