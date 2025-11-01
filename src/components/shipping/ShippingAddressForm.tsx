'use client';

import { useState, useEffect } from 'react';
import { useCartStore, ShippingAddress } from '@/store/cartStore';
import { calculateShippingCost, US_STATES, MINIMUM_SHIPPING_ORDER, formatDeliveryDate, getEstimatedDeliveryDate } from '@/lib/shipping';
import { Package, Truck, Clock, DollarSign } from 'lucide-react';

interface ShippingAddressFormProps {
  onComplete?: () => void;
}

export default function ShippingAddressForm({ onComplete }: ShippingAddressFormProps) {
  const { shippingAddress, setShippingAddress, subtotal } = useCartStore();

  const [formData, setFormData] = useState<ShippingAddress>(
    shippingAddress || {
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: ''
    }
  );

  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});
  const [shippingInfo, setShippingInfo] = useState<ReturnType<typeof calculateShippingCost>>(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState<Date | null>(null);

  // Calculate shipping when state changes
  useEffect(() => {
    if (formData.state) {
      const info = calculateShippingCost(formData.state);
      setShippingInfo(info);

      if (info) {
        const delivery = getEstimatedDeliveryDate(formData.state);
        setEstimatedDelivery(delivery);
      }
    }
  }, [formData.state]);

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingAddress> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.address1.trim()) newErrors.address1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Invalid ZIP code format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Check minimum order
    if (subtotal < MINIMUM_SHIPPING_ORDER) {
      alert(`Minimum order for shipping is $${MINIMUM_SHIPPING_ORDER.toFixed(2)}`);
      return;
    }

    setShippingAddress(formData);
    if (onComplete) onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Shipping Info Banner */}
      {shippingInfo && (
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            border: '2px solid rgba(255, 215, 0, 0.3)'
          }}
        >
          <h3 className="text-lg font-bold mb-3" style={{ color: '#FFD700' }}>
            <Package className="inline w-5 h-5 mr-2" />
            Shipping to {shippingInfo.zoneName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Truck className="inline w-4 h-4 mr-1" style={{ color: '#FF6B35' }} />
              <span style={{ color: '#F8F8F8' }}>
                FedEx 2-Day: <strong>${shippingInfo.shippingRate.toFixed(2)}</strong>
              </span>
            </div>
            <div>
              <Package className="inline w-4 h-4 mr-1" style={{ color: '#FF6B35' }} />
              <span style={{ color: '#F8F8F8' }}>
                Cold Pack: <strong>${shippingInfo.packagingFees.toFixed(2)}</strong>
              </span>
            </div>
            <div>
              <Clock className="inline w-4 h-4 mr-1" style={{ color: '#FF6B35' }} />
              <span style={{ color: '#F8F8F8' }}>
                Arrives: <strong>{estimatedDelivery && formatDeliveryDate(estimatedDelivery).split(',')[0]}</strong>
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255, 215, 0, 0.2)' }}>
            <div className="flex justify-between items-center">
              <span style={{ color: '#F8F8F8' }}>Total Shipping Cost:</span>
              <span className="text-xl font-bold" style={{ color: '#FFD700' }}>
                ${shippingInfo.totalShipping.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Minimum Order Notice */}
      {subtotal < MINIMUM_SHIPPING_ORDER && (
        <div
          className="p-4 rounded-lg text-center"
          style={{
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            border: '2px solid rgba(211, 47, 47, 0.3)'
          }}
        >
          <DollarSign className="inline w-5 h-5 mr-2" style={{ color: '#D32F2F' }} />
          <span style={{ color: '#D32F2F' }}>
            Minimum order for shipping: ${MINIMUM_SHIPPING_ORDER.toFixed(2)}
            (Current: ${subtotal.toFixed(2)})
          </span>
        </div>
      )}

      {/* Form */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold" style={{ color: '#FFD700' }}>
          Shipping Address
        </h3>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#F8F8F8' }}>
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="w-full px-4 py-2 rounded"
              style={{
                backgroundColor: '#1C1C1C',
                color: '#F8F8F8',
                border: errors.firstName ? '1px solid #D32F2F' : '1px solid #444'
              }}
            />
            {errors.firstName && (
              <p className="text-sm mt-1" style={{ color: '#D32F2F' }}>{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#F8F8F8' }}>
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="w-full px-4 py-2 rounded"
              style={{
                backgroundColor: '#1C1C1C',
                color: '#F8F8F8',
                border: errors.lastName ? '1px solid #D32F2F' : '1px solid #444'
              }}
            />
            {errors.lastName && (
              <p className="text-sm mt-1" style={{ color: '#D32F2F' }}>{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Address Fields */}
        <div>
          <label className="block mb-2 text-sm font-semibold" style={{ color: '#F8F8F8' }}>
            Address Line 1 *
          </label>
          <input
            type="text"
            value={formData.address1}
            onChange={(e) => handleChange('address1', e.target.value)}
            placeholder="Street address, P.O. box"
            className="w-full px-4 py-2 rounded"
            style={{
              backgroundColor: '#1C1C1C',
              color: '#F8F8F8',
              border: errors.address1 ? '1px solid #D32F2F' : '1px solid #444'
            }}
          />
          {errors.address1 && (
            <p className="text-sm mt-1" style={{ color: '#D32F2F' }}>{errors.address1}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold" style={{ color: '#F8F8F8' }}>
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            value={formData.address2}
            onChange={(e) => handleChange('address2', e.target.value)}
            placeholder="Apartment, suite, unit, building, floor, etc."
            className="w-full px-4 py-2 rounded"
            style={{
              backgroundColor: '#1C1C1C',
              color: '#F8F8F8',
              border: '1px solid #444'
            }}
          />
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#F8F8F8' }}>
              City *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-4 py-2 rounded"
              style={{
                backgroundColor: '#1C1C1C',
                color: '#F8F8F8',
                border: errors.city ? '1px solid #D32F2F' : '1px solid #444'
              }}
            />
            {errors.city && (
              <p className="text-sm mt-1" style={{ color: '#D32F2F' }}>{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#F8F8F8' }}>
              State *
            </label>
            <select
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className="w-full px-4 py-2 rounded"
              style={{
                backgroundColor: '#1C1C1C',
                color: '#F8F8F8',
                border: errors.state ? '1px solid #D32F2F' : '1px solid #444'
              }}
            >
              <option value="">Select State</option>
              {US_STATES.map(state => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="text-sm mt-1" style={{ color: '#D32F2F' }}>{errors.state}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#F8F8F8' }}>
              ZIP Code *
            </label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              placeholder="12345"
              maxLength={10}
              className="w-full px-4 py-2 rounded"
              style={{
                backgroundColor: '#1C1C1C',
                color: '#F8F8F8',
                border: errors.zipCode ? '1px solid #D32F2F' : '1px solid #444'
              }}
            />
            {errors.zipCode && (
              <p className="text-sm mt-1" style={{ color: '#D32F2F' }}>{errors.zipCode}</p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#F8F8F8' }}>
              Phone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(123) 456-7890"
              className="w-full px-4 py-2 rounded"
              style={{
                backgroundColor: '#1C1C1C',
                color: '#F8F8F8',
                border: errors.phone ? '1px solid #D32F2F' : '1px solid #444'
              }}
            />
            {errors.phone && (
              <p className="text-sm mt-1" style={{ color: '#D32F2F' }}>{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#F8F8F8' }}>
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 rounded"
              style={{
                backgroundColor: '#1C1C1C',
                color: '#F8F8F8',
                border: errors.email ? '1px solid #D32F2F' : '1px solid #444'
              }}
            />
            {errors.email && (
              <p className="text-sm mt-1" style={{ color: '#D32F2F' }}>{errors.email}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-lg font-bold text-lg"
          style={{
            background: subtotal >= MINIMUM_SHIPPING_ORDER
              ? 'linear-gradient(135deg, #FF6B35, #D32F2F)'
              : 'rgba(100, 100, 100, 0.5)',
            color: '#F8F8F8',
            cursor: subtotal >= MINIMUM_SHIPPING_ORDER ? 'pointer' : 'not-allowed'
          }}
          disabled={subtotal < MINIMUM_SHIPPING_ORDER}
        >
          Continue to Checkout
        </button>
      </div>
    </div>
  );
}
