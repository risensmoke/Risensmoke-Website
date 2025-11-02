'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  image: string;
}

const menuItems: MenuItem[] = [
  // Blessed Plates
  {
    id: 'gospel-plate',
    name: 'Gospel Plate',
    description: 'Mini gospel truth about the smoke',
    price: 12.50,
    category: 'Blessed Plates',
    available: true,
    image: '/Assets/plate-1meat.PNG'
  },
  {
    id: 'disciples-plate',
    name: 'Disciples Plate',
    description: 'One meat blessed by the rise',
    price: 15.35,
    category: 'Blessed Plates',
    available: true,
    image: '/Assets/plate-1meat.PNG'
  },
  {
    id: 'trinity-plate',
    name: 'Trinity Plate',
    description: 'Two meats, one holy transformation',
    price: 16.95,
    category: 'Blessed Plates',
    available: true,
    image: '/Assets/plate-2meat.PNG'
  },
  {
    id: 'revelation-plate',
    name: 'Revelation Plate',
    description: 'The truth about real smoke revealed',
    price: 18.45,
    category: 'Blessed Plates',
    available: true,
    image: '/Assets/plate-3meat.PNG'
  },
  {
    id: 'little-rise',
    name: "Rise N Smoke A Little",
    description: 'The Signature Rise N Smoke Lil Rib Plate',
    price: 13.00,
    category: 'Blessed Plates',
    available: true,
    image: '/Assets/plate-rib-small.PNG'
  },
  {
    id: 'lotta-rise',
    name: "Rise N Smoke A Lot",
    description: 'The Signature Rise N Smoke Rib Plate',
    price: 18.45,
    category: 'Blessed Plates',
    available: true,
    image: '/Assets/plate-rib-large.PNG'
  },

  // Sandwiches
  {
    id: 'brisket-sausage',
    name: 'Smokey-Duo',
    description: 'Double Smoked, Double Flavor',
    price: 13.00,
    category: 'Sandwiches',
    available: true,
    image: '/Assets/sand-beef-brisket-saus.jpg'
  },
  {
    id: 'sliced-brisket',
    name: 'Smoke Ring King',
    description: 'Smoke Ring King - Sliced Brisket',
    price: 11.95,
    category: 'Sandwiches',
    available: true,
    image: '/Assets/sand-brisket-slice.jpg'
  },
  {
    id: 'chopped-brisket',
    name: 'Smoke Ring Chopped',
    description: 'Smoke Ring King - Chopped Brisket',
    price: 10.95,
    category: 'Sandwiches',
    available: true,
    image: '/Assets/sand-brisket-chop.jpg'
  },
  {
    id: 'pulled-pork',
    name: 'Rise & Pull Pork',
    description: 'Pork pulled from the rising flames of smoke',
    price: 10.95,
    category: 'Sandwiches',
    available: true,
    image: '/Assets/sand-pull-pork.jpg'
  },
  {
    id: 'hotlink',
    name: 'Fire & Desire',
    description: 'Hotlink with a smokey edge to love',
    price: 8.50,
    category: 'Sandwiches',
    available: true,
    image: '/Assets/sand-hot-link.jpg'
  },
  {
    id: 'jalapeno-cheddar',
    name: 'Cheesey Jalapeno Heat',
    description: 'Sausage kissed with sweet cheese & smokey jalapeno',
    price: 8.50,
    category: 'Sandwiches',
    available: true,
    image: '/Assets/sand-jalapeno-cheddar.jpg'
  },
  {
    id: 'pork-ribs',
    name: 'Rise & Fall Ribs',
    description: 'Rise, Smoke, and Fall from the bone!',
    price: 10.95,
    category: 'Sandwiches',
    available: true,
    image: '/Assets/sand-pork-ribs.jpg'
  },
  {
    id: 'beef-sausage',
    name: 'Beef & Please',
    description: 'Blessed by the rising flames',
    price: 10.95,
    category: 'Sandwiches',
    available: true,
    image: '/Assets/sand-hot-link.jpg'
  },
  {
    id: 'smoke-chicken',
    name: 'Chicken & Smoke',
    description: 'Smokey, finger-lickin goodness',
    price: 10.95,
    category: 'Sandwiches',
    available: true,
    image: '/Assets/sand-smoke-chicken.jpg'
  },

  // Meats by the Pound
  {
    id: 'brisket-quarter',
    name: 'Brisket 1/4 Pound',
    description: 'Premium smoked brisket',
    price: 8.95,
    category: 'Meats',
    available: true,
    image: '/Assets/pound-brisket-slice.jpg'
  },
  {
    id: 'brisket-half',
    name: 'Brisket 1/2 Pound',
    description: 'Premium smoked brisket',
    price: 15.35,
    category: 'Meats',
    available: true,
    image: '/Assets/pound-brisket-slice.jpg'
  },
  {
    id: 'brisket-three-quarter',
    name: 'Brisket 3/4 Pound',
    description: 'Premium smoked brisket',
    price: 18.45,
    category: 'Meats',
    available: true,
    image: '/Assets/pound-brisket-slice.jpg'
  },
  {
    id: 'brisket-pound',
    name: 'Brisket 1 Pound',
    description: 'Premium smoked brisket',
    price: 25.45,
    category: 'Meats',
    available: true,
    image: '/Assets/pound-brisket-slice.jpg'
  },
  {
    id: 'pulled-pork-quarter',
    name: 'Pulled Pork 1/4 Pound',
    description: 'Tender pulled pork shoulder',
    price: 5.95,
    category: 'Meats',
    available: true,
    image: '/Assets/pound-pull-pork.jpg'
  },
  {
    id: 'pulled-pork-half',
    name: 'Pulled Pork 1/2 Pound',
    description: 'Tender pulled pork shoulder',
    price: 11.45,
    category: 'Meats',
    available: true,
    image: '/Assets/pound-pull-pork.jpg'
  },
  {
    id: 'ribs-half',
    name: 'Smoked Ribs 1/2 Pound',
    description: 'Fall-off-the-bone pork ribs',
    price: 11.45,
    category: 'Meats',
    available: true,
    image: '/Assets/sand-pork-ribs.jpg'
  },
  {
    id: 'ribs-pound',
    name: 'Smoked Ribs 1 Pound',
    description: 'Fall-off-the-bone pork ribs',
    price: 19.95,
    category: 'Meats',
    available: true,
    image: '/Assets/sand-pork-ribs.jpg'
  },

  // Favorites
  {
    id: 'brisket-nachos',
    name: 'Brisket Nachos',
    description: 'Tortilla Chips, Chopped Brisket, Sauce & Queso',
    price: 11.95,
    category: 'Favorites',
    available: true,
    image: '/Assets/fav-sidewinder.PNG'
  },
  {
    id: 'loaded-side-winder',
    name: 'Loaded Side Winder',
    description: 'Loaded Fries w/Sauce & Queso, Choice of Meat',
    price: 11.95,
    category: 'Favorites',
    available: true,
    image: '/Assets/fav-sidewinder.PNG'
  },
  {
    id: 'red-pit-burrito',
    name: 'Red Pit Burrito',
    description: 'Seasoned Potatoes, Jalapeño Sausage, Chopped Brisket, Sauce & Queso',
    price: 14.95,
    category: 'Favorites',
    available: true,
    image: '/Assets/fav-potato-loaded.png'
  },
  {
    id: 'baked-potato-plain',
    name: 'Baked Potato Plain',
    description: 'Smoked Baked Potato',
    price: 7.50,
    category: 'Favorites',
    available: true,
    image: '/Assets/fav-potato-plain.PNG'
  },
  {
    id: 'baked-potato-loaded',
    name: 'Baked Potato Loaded',
    description: 'Baked Potato loaded w/Cheese & Sour Cream',
    price: 9.25,
    category: 'Favorites',
    available: true,
    image: '/Assets/fav-potato-loaded.png'
  },
  {
    id: 'baked-potato-works',
    name: 'Baked Potato Loaded with Meat',
    description: 'Loaded Baked Potato w/Meat',
    price: 11.95,
    category: 'Favorites',
    available: true,
    image: '/Assets/fav-potato-works.PNG'
  },

  // Family Meals
  {
    id: 'small-group',
    name: 'Small Smoke Stack',
    description: 'Feeds 3-4 People - Choice of 1 meat, 2 medium sides, bread & sauce',
    price: 44.95,
    category: 'Family Meals',
    available: true,
    image: '/Assets/family-meat-platter.PNG'
  },
  {
    id: 'med-group',
    name: 'Medium Smoke Stack',
    description: 'Feeds 6-8 People - Choice of 2 meats, 2 large sides, bread & sauce',
    price: 82.95,
    category: 'Family Meals',
    available: true,
    image: '/Assets/family-meat-platter.PNG'
  },
  {
    id: 'large-group',
    name: 'Large Smoke Stack',
    description: 'Feeds 10-12 People - Choice of 3 meats, 3 large sides, bread & sauce',
    price: 120.50,
    category: 'Family Meals',
    available: true,
    image: '/Assets/family-meat-platter.PNG'
  },

  // Divine Sides
  {
    id: 'mamas-smoky-mac',
    name: "Mamas Smoky Mac & Cheese",
    description: 'Creamy comfort blessed by the kitchen',
    price: 2.85,
    category: 'Sides',
    available: true,
    image: '/Assets/side-mac-cheese.jpg'
  },
  {
    id: 'blessed-potato-salad',
    name: 'Blessed Potato Salad',
    description: 'Creamy potatoes touched by grace',
    price: 2.85,
    category: 'Sides',
    available: true,
    image: '/Assets/side-potato-salad.PNG'
  },
  {
    id: 'hallelujah-baked-beans',
    name: 'Hallelujah Baked Beans',
    description: 'Baked sweet and smoky, worth the wait',
    price: 2.85,
    category: 'Sides',
    available: true,
    image: '/Assets/side-brisket-beans.PNG'
  },
  {
    id: 'divine-green-beans',
    name: 'Divine Green Beans',
    description: 'Divinely seasoned with love',
    price: 2.85,
    category: 'Sides',
    available: true,
    image: '/Assets/side-green-beans.PNG'
  },
  {
    id: 'salvation-cole-slaw',
    name: 'Salvation Cole Slaw',
    description: 'Fresh salvation in every bite',
    price: 2.85,
    category: 'Sides',
    available: true,
    image: '/Assets/side-cole-slaw.PNG'
  },

  // This and That
  {
    id: 'garden-salad',
    name: 'Garden Salad',
    description: 'Made to order garden salad',
    price: 6.50,
    category: 'This and That',
    available: true,
    image: '/Assets/tt-garden-salad.PNG'
  },
  {
    id: 'chef-salad',
    name: 'Chef Salad',
    description: 'Made to order Chef Salad',
    price: 9.25,
    category: 'This and That',
    available: true,
    image: '/Assets/tt-garden-salad.PNG'
  },
  {
    id: 'side-fries',
    name: 'Side Fries',
    description: 'Crispy golden fries',
    price: 3.50,
    category: 'This and That',
    available: true,
    image: '/Assets/tt-side-fries.PNG'
  },
  {
    id: 'banana-pudding',
    name: 'Banana Pudding',
    description: 'Homemade banana pudding',
    price: 2.99,
    category: 'This and That',
    available: true,
    image: '/Assets/tt-banana-pudding.PNG'
  },
  {
    id: 'ice-cream',
    name: 'Vanilla Ice Cream',
    description: 'Rich & Creamy Vanilla Ice Cream',
    price: 2.99,
    category: 'This and That',
    available: true,
    image: '/Assets/tt-ice-cream.jpg'
  },
  {
    id: 'peach-cobbler',
    name: 'Homemade Peach Cobbler',
    description: 'Delightful Peach Cobbler',
    price: 2.99,
    category: 'This and That',
    available: true,
    image: '/Assets/tt-peach-cobbler.PNG'
  },

  // Drinks
  {
    id: 'sweet-tea',
    name: 'Sweet Tea',
    description: 'Southern sweet tea',
    price: 2.50,
    category: 'Drinks',
    available: true,
    image: '/tt-sweet-tea.png'
  },
  {
    id: 'soda',
    name: 'Soda',
    description: 'Coke, Pepsi, Sprite, and more',
    price: 1.50,
    category: 'Drinks',
    available: true,
    image: '/tt-soda.png'
  },
  {
    id: 'water',
    name: 'Bottled Water',
    description: 'Bottled Water',
    price: 2.00,
    category: 'Drinks',
    available: true,
    image: '/tt-water.jpg'
  }
];

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addItem } = useCartStore();

  const categories = [
    'All',
    'Blessed Plates',
    'Sandwiches',
    'Meats',
    'Favorites',
    'Family Meals',
    'Sides',
    'This and That',
    'Drinks'
  ];

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      quantity: 1,
      modifiers: [],
      image: item.image
    });
  };

  return (
    <div className="min-h-screen py-20 px-4" style={{ backgroundColor: '#1C1C1C' }}>
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-hero text-center mb-4 text-fire-gradient" style={{ fontFamily: "'Rye', serif" }}>
          Our Sacred Menu
        </h1>
        <p className="text-center text-large mb-12" style={{ color: "#F8F8F8" }}>
          Every item kissed by smoke and blessed with flavor
        </p>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
              style={{ minWidth: '140px' }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Section Title */}
        {selectedCategory !== 'All' && (
          <h2 className="text-h2 text-center mb-8 text-primary-gradient">
            {selectedCategory}
          </h2>
        )}

        {/* Menu Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="menu-item-card overflow-hidden">
              {/* Item Image */}
              <div className="relative w-full h-64 -mx-6 -mt-6 mb-4" style={{ backgroundColor: '#2a2a2a' }}>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-fire-red text-white px-3 py-1 rounded-full font-bold shadow-lg">
                  ${item.price.toFixed(2)}
                </div>
              </div>

              {/* Item Details */}
              <h3 className="text-h3 mb-2" style={{ color: "#FF6B35", fontSize: "1.3rem" }}>
                {item.name}
              </h3>
              <p className="mb-4" style={{ color: "#F8F8F8", fontSize: "0.95rem" }}>
                {item.description}
              </p>

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(item)}
                className="w-full btn-primary py-2 text-sm"
                disabled={!item.available}
              >
                {item.available ? 'Add to Cart' : 'Sold Out'}
              </button>
            </div>
          ))}
        </div>

        {/* Special Note */}
        <div className="mt-16 text-center p-8 card" style={{ backgroundColor: "rgba(255, 107, 53, 0.1)", border: "1px solid rgba(255, 107, 53, 0.3)" }}>
          <h3 className="text-h3 mb-4 text-fire-gradient">
            The Rise & Transform Method™
          </h3>
          <p className="text-large" style={{ color: "#F8F8F8" }}>
            We've figured out the secret of how smoke actually works. When we burn our hickory and oak just right,
            the smoke rises in perfect streams, opening up the meat like tiny doors,
            letting all that smoky goodness get deep inside.
          </p>
          <p className="mt-4 font-semibold" style={{ color: "#D32F2F" }}>
            "Real Smoke. Real Deep. Real Good."
          </p>
        </div>
      </div>
    </div>
  );
}