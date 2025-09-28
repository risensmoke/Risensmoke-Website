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

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  specialInstructions: string;
  createAccount: boolean;
  username: string;
  password: string;
  confirmPassword: string;
}

const menuCategories = [
  'All',
  'Blessed Plates',
  'Sandwiches',
  'By The Pound',
  'Sides',
  'Catering Trays'
];

const menuItems: MenuItem[] = [
  // Blessed Plates
  {
    id: 'gospel-plate',
    name: 'Gospel Plate',
    description: 'Mini gospel truth about the smoke',
    price: 12.50,
    category: 'Blessed Plates',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'disciples-plate',
    name: 'Disciples Plate',
    description: 'One meat blessed by the rise',
    price: 15.35,
    category: 'Blessed Plates',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'trinity-plate',
    name: 'Trinity Plate',
    description: 'Two meats, one holy transformation',
    price: 16.95,
    category: 'Blessed Plates',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'revelation-plate',
    name: 'Revelation Plate',
    description: 'The truth about real smoke revealed',
    price: 18.45,
    category: 'Blessed Plates',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'little-rise',
    name: "Rise N Smoke A Little",
    description: 'The Signature Rise N Smoke Lil Rib Plate',
    price: 13.00,
    category: 'Blessed Plates',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'lotta-rise',
    name: "Rise N Smoke A Lot",
    description: 'The Signature Rise N Smoke Rib Plate',
    price: 18.45,
    category: 'Blessed Plates',
    image: '/Food_Image.jpg',
    available: true
  },

  // Sandwiches
  {
    id: 'brisket-sausage',
    name: 'Smokey-Duo',
    description: 'Double Smoked, Double Flavor',
    price: 13.00,
    category: 'Sandwiches',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'sliced-brisket',
    name: 'Smoke Ring King',
    description: 'Smoke Ring King - Sliced Brisket',
    price: 11.95,
    category: 'Sandwiches',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'chopped-brisket',
    name: 'Smoke Ring Chopped',
    description: 'Smoke Ring King - Chopped Brisket',
    price: 10.95,
    category: 'Sandwiches',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'pulled-pork',
    name: 'Rise & Pull Pork',
    description: 'Pork pulled from the rising flames of smoke',
    price: 10.95,
    category: 'Sandwiches',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'hotlink',
    name: 'Fire & Desire',
    description: 'Hotlink with a smokey edge to love',
    price: 8.50,
    category: 'Sandwiches',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'jalapeno-cheddar',
    name: 'Cheesey Jalapeno Heat',
    description: 'Sausage kissed with sweet cheese & smokey jalapeno',
    price: 8.50,
    category: 'Sandwiches',
    image: '/Food_Image.jpg',
    available: true
  },

  // By The Pound
  {
    id: 'brisket-pound',
    name: 'Brisket By The Pound',
    description: 'Heavenly smoke-kissed perfection',
    price: 29.95,
    category: 'By The Pound',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'ribs-pound',
    name: 'Ribs By The Pound',
    description: 'Fall-off-the-bone blessed',
    price: 25.95,
    category: 'By The Pound',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'pulled-pork-pound',
    name: 'Pulled Pork By The Pound',
    description: 'Tender and transformed',
    price: 19.95,
    category: 'By The Pound',
    image: '/Food_Image.jpg',
    available: true
  },

  // Sides
  {
    id: 'potato-salad',
    name: 'Trinity Potato Salad',
    description: 'Three-blessed potato perfection',
    price: 3.50,
    category: 'Sides',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'mac-cheese',
    name: 'Sacred Mac & Cheese',
    description: 'Cheese blessed by the smoke',
    price: 4.50,
    category: 'Sides',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'green-beans',
    name: 'Rise N Green Beans',
    description: 'Beans that rise with flavor',
    price: 3.50,
    category: 'Sides',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'coleslaw',
    name: 'Cool Rise Slaw',
    description: 'The perfect cooling complement',
    price: 3.50,
    category: 'Sides',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'beans',
    name: 'Blessed Beans',
    description: 'Slow-cooked with holy smoke',
    price: 3.50,
    category: 'Sides',
    image: '/Food_Image.jpg',
    available: true
  },

  // Catering Trays
  {
    id: 'family-feast',
    name: 'Family Feast',
    description: 'Feed 4-6 blessed souls',
    price: 65.00,
    category: 'Catering Trays',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'gathering-tray',
    name: 'Gathering Tray',
    description: 'Perfect for 8-10 disciples',
    price: 120.00,
    category: 'Catering Trays',
    image: '/Food_Image.jpg',
    available: true
  },
  {
    id: 'celebration-spread',
    name: 'Celebration Spread',
    description: 'Transform your party (15-20 people)',
    price: 225.00,
    category: 'Catering Trays',
    image: '/Food_Image.jpg',
    available: true
  }
];

export default function OrderPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    pickupDate: '',
    pickupTime: '',
    specialInstructions: '',
    createAccount: false,
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<CheckoutForm>>({});

  const { items, addItem, removeItem, updateQuantity, subtotal, tax, total, clearCart } = useCartStore();

  useEffect(() => {
    // Set default pickup date to today
    const today = new Date().toISOString().split('T')[0];
    setCheckoutForm(prev => ({ ...prev, pickupDate: today }));
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

  const validateForm = (): boolean => {
    const errors: Partial<CheckoutForm> = {};

    if (!checkoutForm.firstName.trim()) errors.firstName = 'First name is required';
    if (!checkoutForm.lastName.trim()) errors.lastName = 'Last name is required';
    if (!checkoutForm.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutForm.email)) {
      errors.email = 'Invalid email format';
    }
    if (!checkoutForm.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(checkoutForm.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone must be 10 digits';
    }
    if (!checkoutForm.pickupTime) errors.pickupTime = 'Pickup time is required';

    // Validate account creation fields if checked
    if (checkoutForm.createAccount) {
      if (!checkoutForm.username.trim()) errors.username = 'Username is required';
      else if (checkoutForm.username.length < 4) errors.username = 'Username must be at least 4 characters';

      if (!checkoutForm.password) errors.password = 'Password is required';
      else if (checkoutForm.password.length < 8) errors.password = 'Password must be at least 8 characters';

      if (!checkoutForm.confirmPassword) errors.confirmPassword = 'Please confirm your password';
      else if (checkoutForm.password !== checkoutForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckoutSubmit = () => {
    if (!validateForm()) return;

    // Generate order number
    const orderNum = 'RSB' + Date.now().toString().slice(-6);
    setOrderNumber(orderNum);
    setOrderConfirmed(true);

    // In production, this would send order to backend
    console.log('Order submitted:', {
      orderNumber: orderNum,
      customer: checkoutForm,
      items: items,
      total: total
    });

    // Clear cart after successful order
    setTimeout(() => {
      clearCart();
    }, 2000);
  };

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setCheckoutForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Generate time slots for pickup
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 11; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const display = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        slots.push({ value: time, display });
      }
    }
    return slots;
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
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
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-32 h-48 sm:h-32 relative flex-shrink-0">
                      <Image
                        src={item.image || '/Food_Image.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#FFD700' }}>
                          {item.name}
                        </h3>
                        <span className="text-lg sm:text-xl font-bold" style={{ color: '#FF6B35' }}>
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm mb-3" style={{ color: '#F8F8F8' }}>
                        {item.description}
                      </p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
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
              className="lg:sticky lg:top-24 rounded-lg p-4 sm:p-6"
              style={{
                backgroundColor: 'rgba(40, 40, 40, 0.9)',
                border: '2px solid rgba(255, 107, 53, 0.3)'
              }}
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: '#FFD700' }}>
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
                  value={checkoutForm.pickupDate}
                  onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 rounded mb-2"
                  style={{
                    backgroundColor: 'rgba(30, 30, 30, 0.8)',
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                    color: '#F8F8F8'
                  }}
                />
                <select
                  value={checkoutForm.pickupTime}
                  onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                  className="w-full px-3 py-2 rounded"
                  style={{
                    backgroundColor: 'rgba(30, 30, 30, 0.8)',
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                    color: '#F8F8F8'
                  }}
                >
                  <option value="">Select pickup time</option>
                  {generateTimeSlots().map(slot => (
                    <option key={slot.value} value={slot.display}>
                      {slot.display}
                    </option>
                  ))}
                </select>
              </div>

              {/* Special Instructions */}
              <div className="mb-6">
                <label className="block mb-2 font-semibold" style={{ color: '#FFD700' }}>
                  Special Instructions
                </label>
                <textarea
                  value={checkoutForm.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
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
                  background: items.length > 0 && checkoutForm.pickupTime
                    ? 'linear-gradient(135deg, #FF6B35, #D32F2F)'
                    : 'rgba(100, 100, 100, 0.5)',
                  color: '#F8F8F8',
                  cursor: items.length > 0 && checkoutForm.pickupTime ? 'pointer' : 'not-allowed'
                }}
                disabled={items.length === 0 || !checkoutForm.pickupTime}
                onClick={() => items.length > 0 && checkoutForm.pickupTime && setShowCheckout(true)}
              >
                {items.length === 0 ? 'Add Items to Cart' : !checkoutForm.pickupTime ? 'Select Pickup Time' : 'Proceed to Checkout'}
              </button>

              {/* Estimated Ready Time */}
              {checkoutForm.pickupTime && (
                <div className="mt-4 text-center">
                  <Clock className="inline w-4 h-4 mr-1" style={{ color: '#FF6B35' }} />
                  <span className="text-sm" style={{ color: '#F8F8F8' }}>
                    Estimated ready by {checkoutForm.pickupTime}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && !orderConfirmed && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-[100000]"
            onClick={() => setShowCheckout(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[100001] p-4">
            <div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:p-6"
              style={{ backgroundColor: '#2a2a2a' }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#FFD700' }}>
                  Checkout Information
                </h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-1 hover:opacity-80"
                  style={{ color: '#F8F8F8' }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#F8F8F8' }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={checkoutForm.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-2 rounded"
                      style={{
                        backgroundColor: '#1C1C1C',
                        color: '#F8F8F8',
                        border: formErrors.firstName ? '1px solid #D32F2F' : '1px solid #444'
                      }}
                    />
                    {formErrors.firstName && (
                      <p className="text-sm mt-1" style={{ color: '#D32F2F' }}>
                        {formErrors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#F8F8F8' }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={checkoutForm.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-2 rounded"
                      style={{
                        backgroundColor: '#1C1C1C',
                        color: '#F8F8F8',
                        border: formErrors.lastName ? '1px solid #D32F2F' : '1px solid #444'
                      }}
                    />
                    {formErrors.lastName && (
                      <p className="text-sm mt-1" style={{ color: '#D32F2F' }}>
                        {formErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#F8F8F8' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={checkoutForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-2 rounded"
                      style={{
                        backgroundColor: '#1C1C1C',
                        color: '#F8F8F8',
                        border: formErrors.email ? '1px solid #D32F2F' : '1px solid #444'
                      }}
                    />
                    {formErrors.email && (
                      <p className="text-sm mt-1" style={{ color: '#D32F2F' }}>
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#F8F8F8' }}>
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={checkoutForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(123) 456-7890"
                      className="w-full px-4 py-2 rounded"
                      style={{
                        backgroundColor: '#1C1C1C',
                        color: '#F8F8F8',
                        border: formErrors.phone ? '1px solid #D32F2F' : '1px solid #444'
                      }}
                    />
                    {formErrors.phone && (
                      <p className="text-sm mt-1" style={{ color: '#D32F2F' }}>
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Creation Option */}
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)' }}
                >
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkoutForm.createAccount}
                      onChange={(e) => setCheckoutForm(prev => ({ ...prev, createAccount: e.target.checked }))}
                      className="mr-3 w-5 h-5"
                      style={{ accentColor: '#FFD700' }}
                    />
                    <span className="font-semibold" style={{ color: '#FFD700' }}>
                      Create an account for faster checkout next time
                    </span>
                  </label>

                  {checkoutForm.createAccount && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block mb-2 text-sm" style={{ color: '#F8F8F8' }}>
                          Username *
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          className="w-full px-4 py-2 rounded"
                          placeholder="Choose a username"
                          style={{
                            backgroundColor: '#1C1C1C',
                            color: '#F8F8F8',
                            border: formErrors.username ? '1px solid #D32F2F' : '1px solid #444'
                          }}
                        />
                        {formErrors.username && (
                          <p className="text-sm mt-1" style={{ color: '#D32F2F' }}>
                            {formErrors.username}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-2 text-sm" style={{ color: '#F8F8F8' }}>
                            Password *
                          </label>
                          <input
                            type="password"
                            value={checkoutForm.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="w-full px-4 py-2 rounded"
                            placeholder="Min. 8 characters"
                            style={{
                              backgroundColor: '#1C1C1C',
                              color: '#F8F8F8',
                              border: formErrors.password ? '1px solid #D32F2F' : '1px solid #444'
                            }}
                          />
                          {formErrors.password && (
                            <p className="text-sm mt-1" style={{ color: '#D32F2F' }}>
                              {formErrors.password}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-2 text-sm" style={{ color: '#F8F8F8' }}>
                            Confirm Password *
                          </label>
                          <input
                            type="password"
                            value={checkoutForm.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className="w-full px-4 py-2 rounded"
                            placeholder="Re-enter password"
                            style={{
                              backgroundColor: '#1C1C1C',
                              color: '#F8F8F8',
                              border: formErrors.confirmPassword ? '1px solid #D32F2F' : '1px solid #444'
                            }}
                          />
                          {formErrors.confirmPassword && (
                            <p className="text-sm mt-1" style={{ color: '#D32F2F' }}>
                              {formErrors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 p-3 rounded" style={{ backgroundColor: 'rgba(255, 107, 53, 0.1)' }}>
                        <p className="text-sm" style={{ color: '#FF6B35' }}>
                          ✓ Save your order history<br />
                          ✓ Quick reorder your favorites<br />
                          ✓ Earn loyalty points
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block mb-2 text-sm" style={{ color: '#F8F8F8' }}>
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={checkoutForm.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded"
                    style={{
                      backgroundColor: '#1C1C1C',
                      color: '#F8F8F8',
                      border: '1px solid #444'
                    }}
                    placeholder="Any special requests or dietary restrictions..."
                  />
                </div>

                {/* Order Summary */}
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: '#1C1C1C', border: '1px solid #FF6B35' }}
                >
                  <h3 className="text-base sm:text-lg font-bold mb-3" style={{ color: '#FFD700' }}>
                    Order Summary
                  </h3>
                  <div className="space-y-2 mb-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs sm:text-sm">
                        <span style={{ color: '#F8F8F8' }}>
                          {item.quantity}x {item.name}
                        </span>
                        <span style={{ color: '#FF6B35' }}>
                          ${(item.basePrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-gray-600">
                    <div className="flex justify-between font-bold">
                      <span style={{ color: '#FFD700' }}>Total</span>
                      <span style={{ color: '#FFD700' }}>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm" style={{ color: '#F8F8F8' }}>
                      <Clock className="inline w-4 h-4 mr-1" style={{ color: '#FF6B35' }} />
                      Pickup Time: {checkoutForm.pickupTime}
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleCheckoutSubmit}
                  className="w-full py-3 rounded-lg font-bold text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B35, #D32F2F)',
                    color: '#F8F8F8'
                  }}
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Order Confirmation Modal */}
      {orderConfirmed && (
        <>
          <div className="fixed inset-0 bg-black/70 z-[100000]" />
          <div className="fixed inset-0 flex items-center justify-center z-[100001] p-4">
            <div
              className="w-full max-w-md text-center p-6 sm:p-8 rounded-lg mx-4"
              style={{ backgroundColor: '#2a2a2a' }}
            >
              <div
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 215, 0, 0.2)' }}
              >
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="#FFD700"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2
                className="text-2xl sm:text-3xl font-bold mb-3"
                style={{
                  color: '#FFD700',
                  fontFamily: "'Alfa Slab One', serif"
                }}
              >
                Order Confirmed!
              </h2>

              <p className="text-base sm:text-lg mb-2" style={{ color: '#F8F8F8' }}>
                Your order number is:
              </p>

              <div
                className="text-xl sm:text-2xl font-bold mb-6 py-3 rounded"
                style={{
                  color: '#FF6B35',
                  backgroundColor: 'rgba(255, 107, 53, 0.1)',
                  border: '2px dashed #FF6B35'
                }}
              >
                {orderNumber}
              </div>

              <p className="text-sm sm:text-base mb-6" style={{ color: '#F8F8F8' }}>
                We've received your order and it will be ready for pickup at:
              </p>

              <div className="mb-6">
                <p className="text-lg sm:text-xl font-bold" style={{ color: '#FFD700' }}>
                  {checkoutForm.pickupTime}
                </p>
              </div>

              <p className="text-sm mb-4" style={{ color: '#999' }}>
                A confirmation email has been sent to {checkoutForm.email}
              </p>

              {checkoutForm.createAccount && (
                <div className="mb-6 p-3 rounded" style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }}>
                  <p className="text-sm font-semibold" style={{ color: '#FFD700' }}>
                    ✓ Account created successfully!
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#F8F8F8' }}>
                    You can now log in with username: {checkoutForm.username}
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setOrderConfirmed(false);
                  setShowCheckout(false);
                  setCheckoutForm({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    pickupDate: new Date().toISOString().split('T')[0],
                    pickupTime: '',
                    specialInstructions: '',
                    createAccount: false,
                    username: '',
                    password: '',
                    confirmPassword: ''
                  });
                }}
                className="w-full py-3 rounded-lg font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35, #D32F2F)',
                  color: '#F8F8F8'
                }}
              >
                Start New Order
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}