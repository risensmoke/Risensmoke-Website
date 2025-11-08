'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package, Truck, Snowflake, Award, MapPin, Clock } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import ShippingAddressForm from '@/components/shipping/ShippingAddressForm';
import { SHIPPING_ZONES } from '@/lib/shipping';

interface ShippingPackage {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  image: string;
  serves: string;
  items: string[];
  weight: string;
}

const SHIPPING_PACKAGES: ShippingPackage[] = [
  {
    id: 'bbq-lovers-pack',
    name: 'BBQ Lovers Pack',
    description: 'The perfect introduction to Rise N\' Smoke',
    longDescription: 'Experience the magic of our Rise & Transform Method™ with a curated selection of our signature BBQ meats.',
    price: 89.95,
    serves: '4-6 people',
    weight: '4 lbs',
    image: '/Assets/family-meat-platter.PNG',
    items: [
      '1 lb Sliced Brisket',
      '1 lb Pulled Pork',
      '1/2 lb Smoked Ribs',
      '1/2 lb Hot Link Sausage',
      '2 Sides (Mac & Cheese, Baked Beans)',
      'BBQ Sauce (2 bottles)'
    ]
  },
  {
    id: 'brisket-bundle',
    name: 'Brisket Lover\'s Bundle',
    description: 'Premium smoked brisket perfection',
    longDescription: 'For the true brisket connoisseur. Our award-winning brisket smoked low and slow with oak.',
    price: 129.95,
    serves: '6-8 people',
    weight: '5 lbs',
    image: '/Assets/pound-brisket-slice.jpg',
    items: [
      '3 lbs Sliced Brisket (Premium Cut)',
      '1 lb Chopped Brisket',
      '1 lb Brisket Burnt Ends',
      'BBQ Sauce (3 bottles)',
      'Pickles & Onions'
    ]
  },
  {
    id: 'rib-feast',
    name: 'Rib Feast Package',
    description: 'Fall-off-the-bone tender ribs',
    longDescription: 'Full racks of our famous pork ribs, smoked to perfection with our signature dry rub.',
    price: 109.95,
    serves: '4-6 people',
    weight: '4.5 lbs',
    image: '/Assets/plate-rib-large.PNG',
    items: [
      '2 Full Racks of Pork Ribs',
      '1 lb Pulled Pork',
      '2 Sides (Cole Slaw, Potato Salad)',
      'BBQ Sauce (2 bottles)',
      'Texas Toast (1 loaf)'
    ]
  },
  {
    id: 'family-feast',
    name: 'Family Feast',
    description: 'Feed the whole crew with authentic Texas BBQ',
    longDescription: 'Our most popular package! Everything you need for an unforgettable BBQ feast at home.',
    price: 169.95,
    serves: '8-10 people',
    weight: '8 lbs',
    image: '/Assets/plate-3meat.PNG',
    items: [
      '2 lbs Sliced Brisket',
      '2 lbs Pulled Pork',
      '1 Full Rack of Ribs',
      '1 lb Sausage (Your choice)',
      '4 Sides (Choose from our menu)',
      'BBQ Sauce (4 bottles)',
      'Texas Toast (2 loaves)'
    ]
  },
  {
    id: 'pork-paradise',
    name: 'Pork Paradise',
    description: 'Everything pork, smoked to perfection',
    longDescription: 'A pork lover\'s dream featuring our tender pulled pork and succulent ribs.',
    price: 99.95,
    serves: '5-7 people',
    weight: '5 lbs',
    image: '/Assets/sand-pull-pork.jpg',
    items: [
      '2 lbs Pulled Pork',
      '1 Full Rack of Pork Ribs',
      '1 lb Pork Sausage',
      '2 Sides (Green Beans, Mac & Cheese)',
      'BBQ Sauce (2 bottles)'
    ]
  },
  {
    id: 'sampler-pack',
    name: 'Texas Sampler',
    description: 'Taste a bit of everything',
    longDescription: 'Can\'t decide? Try our sampler with a taste of all our signature meats.',
    price: 119.95,
    serves: '6-8 people',
    weight: '6 lbs',
    image: '/Assets/plate-2meat.PNG',
    items: [
      '1 lb Sliced Brisket',
      '1 lb Pulled Pork',
      '1/2 Rack of Ribs',
      '1/2 lb Hot Link',
      '1/2 lb Jalapeno Cheddar Sausage',
      '3 Sides (Your choice)',
      'BBQ Sauce (3 bottles)'
    ]
  }
];

export default function ShipPage() {
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ShippingPackage | null>(null);
  const { addItem, setOrderType, toggleCart } = useCartStore();

  const handleAddToCart = (pkg: ShippingPackage) => {
    setOrderType('shipping');
    addItem({
      menuItemId: pkg.id,
      name: pkg.name,
      basePrice: pkg.price,
      quantity: 1,
      modifiers: [],
      image: pkg.image
    });
    toggleCart();
  };

  const handleOrderPackage = (pkg: ShippingPackage) => {
    setSelectedPackage(pkg);
    handleAddToCart(pkg);
    setShowShippingForm(true);
  };

  return (
    <div className="min-h-screen py-20 px-4" style={{ backgroundColor: '#1C1C1C' }}>
      <div className="container mx-auto max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl lg:text-hero mb-4"
            style={{
              fontFamily: "'Rye', serif",
              background: 'linear-gradient(135deg, #FF6B35, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            SHIP NATIONWIDE
          </h1>
          <p className="text-xl mb-4" style={{ color: '#FFD700', fontFamily: "'Rye', serif" }}>
            Texas BBQ Delivered to Your Door
          </p>
          <p className="text-lg max-w-3xl mx-auto" style={{ color: '#F8F8F8' }}>
            Experience authentic Texas BBQ anywhere in America. Our signature meats are smoked fresh,
            vacuum-sealed, and shipped via FedEx 2-Day in insulated coolers with dry ice.
          </p>
        </div>

        {/* Why Ship With Us */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center p-6 rounded-lg" style={{ backgroundColor: 'rgba(40, 40, 40, 0.8)' }}>
            <Package className="w-12 h-12 mx-auto mb-3" style={{ color: '#FF6B35' }} />
            <h3 className="font-bold mb-2" style={{ color: '#FFD700' }}>Insulated Packaging</h3>
            <p className="text-sm" style={{ color: '#F8F8F8' }}>
              Premium coolers with dry ice keep everything fresh
            </p>
          </div>
          <div className="text-center p-6 rounded-lg" style={{ backgroundColor: 'rgba(40, 40, 40, 0.8)' }}>
            <Truck className="w-12 h-12 mx-auto mb-3" style={{ color: '#FF6B35' }} />
            <h3 className="font-bold mb-2" style={{ color: '#FFD700' }}>FedEx 2-Day</h3>
            <p className="text-sm" style={{ color: '#F8F8F8' }}>
              Fast, reliable shipping across all 50 states
            </p>
          </div>
          <div className="text-center p-6 rounded-lg" style={{ backgroundColor: 'rgba(40, 40, 40, 0.8)' }}>
            <Snowflake className="w-12 h-12 mx-auto mb-3" style={{ color: '#FF6B35' }} />
            <h3 className="font-bold mb-2" style={{ color: '#FFD700' }}>Stay Fresh</h3>
            <p className="text-sm" style={{ color: '#F8F8F8' }}>
              Arrives cold and ready to heat and eat
            </p>
          </div>
          <div className="text-center p-6 rounded-lg" style={{ backgroundColor: 'rgba(40, 40, 40, 0.8)' }}>
            <Award className="w-12 h-12 mx-auto mb-3" style={{ color: '#FF6B35' }} />
            <h3 className="font-bold mb-2" style={{ color: '#FFD700' }}>Quality Guaranteed</h3>
            <p className="text-sm" style={{ color: '#F8F8F8' }}>
              100% satisfaction or your money back
            </p>
          </div>
        </div>

        {/* Shipping Zones Map */}
        <div className="mb-12 p-6 rounded-lg" style={{ backgroundColor: 'rgba(40, 40, 40, 0.8)' }}>
          <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: '#FFD700' }}>
            <MapPin className="inline w-6 h-6 mr-2" />
            Shipping Zones & Rates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SHIPPING_ZONES.map((zone, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'rgba(255, 107, 53, 0.1)', border: '1px solid rgba(255, 107, 53, 0.3)' }}
              >
                <h3 className="font-bold mb-2" style={{ color: '#FF6B35' }}>{zone.name}</h3>
                <p className="text-sm mb-2" style={{ color: '#F8F8F8' }}>
                  {zone.states.join(', ')}
                </p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255, 107, 53, 0.2)' }}>
                  <span className="text-sm" style={{ color: '#F8F8F8' }}>Shipping:</span>
                  <span className="font-bold" style={{ color: '#FFD700' }}>${zone.rate.toFixed(2)}</span>
                </div>
                <p className="text-xs mt-2" style={{ color: '#999' }}>
                  <Clock className="inline w-3 h-3 mr-1" />
                  {zone.transitDays} day delivery
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm text-center mt-4" style={{ color: '#F8F8F8' }}>
            * Plus $30 for insulated packaging, dry ice & handling
          </p>
        </div>

        {/* Packages */}
        {!showShippingForm ? (
          <>
            <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: '#FFD700' }}>
              Shipping Packages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {SHIPPING_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(40, 40, 40, 0.9)',
                    border: '2px solid rgba(255, 107, 53, 0.3)'
                  }}
                >
                  {/* Image */}
                  <div className="relative w-full aspect-[4/3]" style={{ backgroundColor: '#2a2a2a' }}>
                    <Image
                      src={pkg.image}
                      alt={pkg.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div
                      className="absolute top-4 right-4 px-3 py-1 rounded-full font-bold"
                      style={{ backgroundColor: '#D32F2F', color: '#F8F8F8' }}
                    >
                      ${pkg.price.toFixed(2)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2" style={{ color: '#FFD700' }}>
                      {pkg.name}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: '#FF6B35' }}>
                      {pkg.description}
                    </p>
                    <p className="text-sm mb-4" style={{ color: '#F8F8F8' }}>
                      {pkg.longDescription}
                    </p>

                    <div className="flex justify-between text-sm mb-4 pb-4 border-b" style={{ borderColor: 'rgba(255, 107, 53, 0.2)' }}>
                      <span style={{ color: '#F8F8F8' }}>Serves:</span>
                      <span style={{ color: '#FFD700' }}>{pkg.serves}</span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-bold mb-2" style={{ color: '#F8F8F8' }}>Includes:</p>
                      <ul className="text-sm space-y-1">
                        {pkg.items.map((item, idx) => (
                          <li key={idx} style={{ color: '#F8F8F8' }}>
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleOrderPackage(pkg)}
                      className="w-full py-3 rounded-lg font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #FF6B35, #D32F2F)',
                        color: '#F8F8F8'
                      }}
                    >
                      Ship This Package
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>
            <button
              onClick={() => setShowShippingForm(false)}
              className="mb-6 px-6 py-2 rounded-lg font-semibold"
              style={{
                backgroundColor: 'rgba(255, 107, 53, 0.2)',
                border: '2px solid #FF6B35',
                color: '#FF6B35'
              }}
            >
              ← Back to Packages
            </button>
            <div
              className="max-w-3xl mx-auto p-6 rounded-lg"
              style={{ backgroundColor: 'rgba(40, 40, 40, 0.9)' }}
            >
              <ShippingAddressForm onComplete={() => {
                alert('Address saved! Proceed to checkout to complete your order.');
              }} />
            </div>
          </div>
        )}

        {/* Heating Instructions */}
        <div className="mt-12 p-8 rounded-lg" style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)', border: '2px solid rgba(255, 215, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: '#FFD700' }}>
            Easy Heating Instructions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold mb-2" style={{ color: '#FF6B35' }}>1</div>
              <h3 className="font-bold mb-2" style={{ color: '#FFD700' }}>Thaw</h3>
              <p className="text-sm" style={{ color: '#F8F8F8' }}>
                Remove from packaging and thaw in refrigerator overnight
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2" style={{ color: '#FF6B35' }}>2</div>
              <h3 className="font-bold mb-2" style={{ color: '#FFD700' }}>Heat</h3>
              <p className="text-sm" style={{ color: '#F8F8F8' }}>
                Reheat in oven at 300°F for 45-60 minutes or until heated through
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2" style={{ color: '#FF6B35' }}>3</div>
              <h3 className="font-bold mb-2" style={{ color: '#FFD700' }}>Enjoy!</h3>
              <p className="text-sm" style={{ color: '#F8F8F8' }}>
                Serve with our signature BBQ sauce and enjoy authentic Texas BBQ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
