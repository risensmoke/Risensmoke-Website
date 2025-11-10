'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Clock, Plus, Minus, X, Calendar } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import SizeSelectionModal from '@/components/menu/SizeSelectionModal';
import PlateCustomizationModal from '@/components/menu/PlateCustomizationModal';
import CondimentSelectionModal from '@/components/menu/CondimentSelectionModal';
import FavoritesCustomizationModal from '@/components/menu/FavoritesCustomizationModal';

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
  'Meats',
  'Favorites',
  'Family Meals',
  'Sides',
  'Desserts',
  'Extras'
];

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
    description: 'Double Smoked, Double Flavor *sausage & chopped brisket - no subs*',
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
    id: 'pulled-pork-sandwich',
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
    description: 'Sausage kissed with cheddar cheese & smokey jalapeno',
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
    image: '/Assets/sand-pork-ribs.jpeg'
  },
  {
    id: 'beef-sausage-sandwich',
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
    id: 'brisket-sliced',
    name: 'Sliced Brisket',
    description: 'Premium smoked sliced brisket - Select weight - price per pound listed',
    price: 25.45,
    category: 'Meats',
    available: true,
    image: '/Assets/pound-brisket-slice.jpg'
  },
  {
    id: 'brisket-chopped',
    name: 'Chopped Brisket',
    description: 'Premium smoked chopped brisket - Select weight - price per pound listed',
    price: 19.95,
    category: 'Meats',
    available: true,
    image: '/Assets/pound-brisket-chop.jpg'
  },
  {
    id: 'pulled-pork',
    name: 'Pulled Pork',
    description: 'Tender pulled pork shoulder - Select weight - price per pound listed',
    price: 19.95,
    category: 'Meats',
    available: true,
    image: '/Assets/pound-pull-pork.jpeg'
  },
  {
    id: 'smoked-ribs',
    name: 'Smoked Ribs',
    description: 'Fall-off-the-bone pork ribs - Select weight - price per pound listed',
    price: 19.95,
    category: 'Meats',
    available: true,
    image: '/Assets/pound-pork-ribs.jpg'
  },
  {
    id: 'smoked-chicken',
    name: 'Smoked Chicken',
    description: 'Tender smoked chicken - Select weight - price per pound listed',
    price: 19.95,
    category: 'Meats',
    available: true,
    image: '/Assets/pound-smoke-chicken.jpg'
  },
  {
    id: 'jalapeno-sausage',
    name: 'Jalapeño Cheddar Sausage',
    description: 'Spicy jalapeño sausage - Select weight - price per pound listed',
    price: 19.95,
    category: 'Meats',
    available: true,
    image: '/Assets/pound-jalapeno-sausage.jpg'
  },
  {
    id: 'beef-sausage',
    name: 'Beef Sausage',
    description: 'Premium beef sausage - Select weight - price per pound listed',
    price: 19.95,
    category: 'Meats',
    available: true,
    image: '/Assets/pound-beef-sausage.jpg'
  },
  {
    id: 'hot-link',
    name: 'Hot Link',
    description: 'Spicy hot link sausage - Select weight - price per pound listed',
    price: 19.95,
    category: 'Meats',
    available: true,
    image: '/Assets/pound-hot-link.jpg'
  },


  // Favorites
  {
    id: 'brisket-nachos',
    name: 'Brisket Nachos',
    description: 'Tortilla Chips, Chopped Brisket, Sauce & Queso',
    price: 11.95,
    category: 'Favorites',
    available: true,
    image: '/Assets/fav-brisket-nachos.jpg'
  },
  {
    id: 'loaded-side-winder',
    name: 'Loaded Side Winder',
    description: 'Loaded Fries w/Sauce & Queso, Choice of Meat',
    price: 15.35,
    category: 'Favorites',
    available: true,
    image: '/Assets/fav-sidewinder.PNG'
  },
  {
    id: 'red-pit-burrito',
    name: 'Red Pit Burrito',
    description: 'Seasoned Potatoes, Jalapeño Cheddar Sausage, Chopped Brisket, Sauce & Queso',
    price: 7.95,
    category: 'Favorites',
    available: true,
    image: '/Assets/fav-burrito-redpit.jpeg'
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
    id: 'baked-potato-stuffed',
    name: 'Baked Potato Stuffed',
    description: 'Baked Potato stuffed w/Cheese & Sour Cream',
    price: 9.25,
    category: 'Favorites',
    available: true,
    image: '/Assets/fav-potato-stuffed.PNG'
  },
  {
    id: 'baked-potato-loaded',
    name: 'Baked Potato Loaded',
    description: 'Loaded Baked Potato w/Meat',
    price: 11.95,
    category: 'Favorites',
    available: true,
    image: '/Assets/fav-potato-loaded.png'
  },
  {
    id: 'wraparound',
    name: 'Sausage Wraparound',
    description: 'Sausage Wraparound with your choice of premium sausage',
    price: 7.25,
    category: 'Favorites',
    available: true,
    image: '/Assets/extra-wraparound.jpg'
  },

  // Family Meals
  {
    id: 'small-group',
    name: 'Small Smoke Stack',
    description: 'Feeds 3-4 People - 1lb of Meat choice, 2 medium sides, bread & sauce',
    price: 44.95,
    category: 'Family Meals',
    available: true,
    image: '/Assets/family-meat-platter.jpeg'
  },
  {
    id: 'med-group',
    name: 'Medium Smoke Stack',
    description: 'Feeds 6-8 People - 2lbs of Meat choice, 2 large sides, bread & sauce',
    price: 82.95,
    category: 'Family Meals',
    available: true,
    image: '/Assets/family-meat-platter.jpeg'
  },
  {
    id: 'large-group',
    name: 'Large Smoke Stack',
    description: 'Feeds 10-12 People - 3lbs of Meat choice, 3 large sides, bread & sauce',
    price: 120.50,
    category: 'Family Meals',
    available: true,
    image: '/Assets/family-meat-platter.jpeg'
  },

  // Divine Sides
  {
    id: 'mamas-smoky-mac',
    name: "Mamas Smoky Mac & Cheese",
    description: 'Creamy comfort blessed by the kitchen - Choose from S, M, or L',
    price: 2.85,
    category: 'Sides',
    available: true,
    image: '/Assets/side-mac-cheese.jpg'
  },
  {
    id: 'blessed-potato-salad',
    name: 'Blessed Potato Salad',
    description: 'Creamy potatoes touched by grace - Choose from S, M, or L',
    price: 2.85,
    category: 'Sides',
    available: true,
    image: '/Assets/side-potato-salad.PNG'
  },
  {
    id: 'hallelujah-baked-beans',
    name: 'Hallelujah Baked Beans',
    description: 'Baked sweet and smoky, worth the wait - Choose from S, M, or L',
    price: 2.85,
    category: 'Sides',
    available: true,
    image: '/Assets/side-brisket-beans.PNG'
  },
  {
    id: 'divine-green-beans',
    name: 'Divine Green Beans',
    description: 'Divinely seasoned with love - Choose from S, M, or L',
    price: 2.85,
    category: 'Sides',
    available: true,
    image: '/Assets/side-green-beans.PNG'
  },
  {
    id: 'salvation-cole-slaw',
    name: 'Salvation Cole Slaw',
    description: 'Fresh salvation in every bite - Choose from S, M, or L',
    price: 2.85,
    category: 'Sides',
    available: true,
    image: '/Assets/side-cole-slaw.PNG'
  },

  // Additional Favorites
  {
    id: 'garden-salad',
    name: 'Garden Salad',
    description: 'Made to order garden salad',
    price: 6.50,
    category: 'Favorites',
    available: true,
    image: '/Assets/fav-garden-salad.PNG'
  },
  {
    id: 'chef-salad-meat',
    name: 'Chef Salad with Meat',
    description: 'Made to order Chef Salad with your choice of smoked meat',
    price: 9.25,
    category: 'Favorites',
    available: true,
    image: '/Assets/fav-chef-salad-meat.jpg'
  },
  {
    id: 'side-fries',
    name: 'French Fries',
    description: 'Small, Large, Family',
    price: 2.85,
    category: 'Sides',
    available: true,
    image: '/Assets/side-french-fries.PNG'
  },
  {
    id: 'banana-pudding',
    name: 'Banana Pudding',
    description: 'Homemade banana pudding',
    price: 4.95,
    category: 'Desserts',
    available: true,
    image: '/Assets/dessert-banana-pudding.PNG'
  },
  {
    id: 'ice-cream',
    name: 'Vanilla Ice Cream',
    description: 'Rich & Creamy Vanilla Ice Cream',
    price: 1.25,
    category: 'Desserts',
    available: true,
    image: '/Assets/dessert-ice-cream.jpg'
  },
  {
    id: 'peach-cobbler',
    name: 'Homemade Peach Cobbler',
    description: 'Delightful Peach Cobbler',
    price: 4.95,
    category: 'Desserts',
    available: true,
    image: '/Assets/dessert-peach-cobbler.PNG'
  },

  // Extras
  {
    id: 'sweet-tea',
    name: 'Tea',
    description: 'Assorted variety of southern tea (unsweet, sweet, extra sweet)',
    price: 2.50,
    category: 'Extras',
    available: true,
    image: '/Assets/extra-ice-tea.jpg'
  },
  {
    id: 'soda',
    name: 'Soda',
    description: 'Assorted variety of Coca-Cola™, Pepsi™, and Dr Pepper™ products',
    price: 1.50,
    category: 'Extras',
    available: true,
    image: '/Assets/extra-drinks-soda.jpg'
  },
  {
    id: 'water',
    name: 'Bottled Water',
    description: 'Bottled Water',
    price: 2.00,
    category: 'Extras',
    available: true,
    image: '/Assets/extra-bottle-water.jpg'
  },
  {
    id: 'potato-chips',
    name: 'Potato Chips',
    description: 'Assorted variety of Frito Lay™ chips',
    price: 1.35,
    category: 'Extras',
    available: true,
    image: '/Assets/extra-chips-variety.jpg'
  },
  {
    id: 'lil-wrangler-meal',
    name: 'Lil Wrangler Meal',
    description: 'Chopped Beef Wraparound, Chips, Cookies, Capri-Sun',
    price: 7.95,
    category: 'Extras',
    available: true,
    image: '/Assets/extra-kids-meal.jpg'
  },
  {
    id: 'sausage-stick',
    name: 'Sausage on a Stick',
    description: 'Sausage on a Stick',
    price: 7.25,
    category: 'Extras',
    available: true,
    image: '/Assets/extra-sausage-stick.jpg'
  }
];

const sidesSizeOptions = [
  { label: '4 oz', price: 2.85 },
  { label: '16 oz', price: 8.00 },
  { label: '32 oz', price: 12.00 }
];

const frenchFriesSizeOptions = [
  { label: 'Small', price: 2.85 },
  { label: 'Large', price: 8.00 },
  { label: 'Family', price: 12.00 }
];

const standardMeatWeightOptions = [
  { label: '1/4 lb', price: 5.95 },
  { label: '1/2 lb', price: 11.45 },
  { label: '3/4 lb', price: 16.35 },
  { label: '1 lb', price: 19.95 }
];

const premiumMeatWeightOptions = [
  { label: '1/4 lb', price: 8.95 },
  { label: '1/2 lb', price: 15.35 },
  { label: '3/4 lb', price: 18.45 },
  { label: '1 lb', price: 25.45 }
];

const meatOptions = [
  { label: 'Sliced Brisket', price: 0.00 },
  { label: 'Chopped Brisket', price: 0.00 },
  { label: 'Pulled Pork', price: 0.00 },
  { label: 'Smoked Ribs', price: 0.00 },
  { label: 'Smoked Chicken', price: 0.00 },
  { label: 'Jalapeño Cheddar Sausage', price: 0.00 },
  { label: 'Beef Sausage', price: 0.00 },
  { label: 'Hot Link', price: 0.00 }
];

const sidesOptions = [
  { label: 'Mamas Smoky Mac & Cheese', price: 0.00 },
  { label: 'Blessed Potato Salad', price: 0.00 },
  { label: 'Hallelujah Baked Beans', price: 0.00 },
  { label: 'Divine Green Beans', price: 0.00 },
  { label: 'Salvation Cole Slaw', price: 0.00 }
];

const condimentOptions = [
  { label: 'Smoky BBQ Sauce', price: 0.00 },
  { label: 'Sweet & Spicy BBQ Sauce', price: 0.00 },
  { label: 'Pickles', price: 0.00 },
  { label: 'Onions', price: 0.00 },
  { label: 'Jalapenos', price: 0.00 },
  { label: 'Ketchup', price: 0.00 }
];

// Favorites meat options
const favoritesMeatOptions = [
  { label: 'Chopped Brisket', price: 0.00 },
  { label: 'Pulled Pork', price: 0.00 },
  { label: 'Smoked Chicken', price: 0.00 },
  { label: 'Jalapeno Cheddar Sausage', price: 0.00 },
  { label: 'Beef Sausage', price: 0.00 },
  { label: 'Hot Link', price: 0.00 }
];

// Favorites topping options
const favoritesToppingOptions = [
  { label: 'Shredded Cheddar Cheese', price: 1.00, category: 'topping' as const },
  { label: 'Queso', price: 1.85, category: 'topping' as const },
  { label: 'Sour Cream', price: 0.50, category: 'topping' as const },
  { label: 'Ranch Dressing', price: 0.50, category: 'dressing' as const },
  { label: 'Italian Dressing', price: 0.50, category: 'dressing' as const }
];

// Plate configurations
const plateConfigs: { [key: string]: { meatCount: number; sideCount: number; excludeRibs?: boolean } } = {
  'gospel-plate': { meatCount: 1, sideCount: 2, excludeRibs: true },
  'disciples-plate': { meatCount: 1, sideCount: 2, excludeRibs: true },
  'trinity-plate': { meatCount: 2, sideCount: 2 },
  'revelation-plate': { meatCount: 3, sideCount: 2 },
  'little-rise': { meatCount: 0, sideCount: 2 },
  'lotta-rise': { meatCount: 0, sideCount: 2 },
  'small-group': { meatCount: 1, sideCount: 2 },
  'med-group': { meatCount: 2, sideCount: 2 },
  'large-group': { meatCount: 3, sideCount: 3 }
};

function OrderPageContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sizeModalItem, setSizeModalItem] = useState<MenuItem | null>(null);
  const [plateModalItem, setPlateModalItem] = useState<MenuItem | null>(null);
  const [meatWeightModalItem, setMeatWeightModalItem] = useState<MenuItem | null>(null);
  const [condimentModalItem, setCondimentModalItem] = useState<MenuItem | null>(null);
  const [favoritesModalItem, setFavoritesModalItem] = useState<MenuItem | null>(null);
  const [pendingMeatData, setPendingMeatData] = useState<{
    item: MenuItem;
    weight: { label: string; price: number };
  } | null>(null);
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

  // Set category from URL parameter
  useEffect(() => {
    const category = searchParams.get('category');
    if (category && menuCategories.includes(category)) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const handleAddToCart = (item: MenuItem) => {
    // Show size selection modal for Sides
    if (item.category === 'Sides') {
      setSizeModalItem(item);
      return;
    }

    // Show plate customization modal for Blessed Plates and Family Meals
    if ((item.category === 'Blessed Plates' || item.category === 'Family Meals') && plateConfigs[item.id]) {
      setPlateModalItem(item);
      return;
    }

    // Show weight selection modal for Meats
    if (item.category === 'Meats') {
      setMeatWeightModalItem(item);
      return;
    }

    // Show condiment modal for Sandwiches
    if (item.category === 'Sandwiches') {
      setCondimentModalItem(item);
      return;
    }

    // Show favorites customization modal for Favorites
    if (item.category === 'Favorites') {
      setFavoritesModalItem(item);
      return;
    }

    const quantity = itemQuantities[item.id] || 1;
    addItem({
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      quantity: quantity,
      modifiers: [],
      image: item.image
    });
    setItemQuantities({ ...itemQuantities, [item.id]: 1 });
  };

  const handleSizeSelection = (item: MenuItem, size: { label: string; price: number }) => {
    // For sides, the base price is the 4oz price (2.85)
    // We add a modifier for the selected size with appropriate price adjustment
    const baseSidePrice = 2.85;
    const modifierPrice = size.price - baseSidePrice;
    const quantity = itemQuantities[item.id] || 1;

    addItem({
      menuItemId: item.id,
      name: item.name,
      basePrice: baseSidePrice,
      quantity: quantity,
      modifiers: [{
        id: `size-${size.label}`,
        name: size.label,
        price: modifierPrice,
        category: 'Size'
      }],
      image: item.image
    });
    setItemQuantities({ ...itemQuantities, [item.id]: 1 });
  };

  const handlePlateCustomization = (
    item: MenuItem,
    meats: { label: string; price: number }[],
    sides: { label: string; price: number }[],
    condiments: { label: string; price: number }[]
  ) => {
    const quantity = itemQuantities[item.id] || 1;
    const modifiers = [
      ...meats.map((meat, idx) => ({
        id: `meat-${idx}-${meat.label}`,
        name: meat.label,
        price: meat.price,
        category: 'Meat'
      })),
      ...sides.map((side, idx) => ({
        id: `side-${idx}-${side.label}`,
        name: side.label,
        price: side.price,
        category: 'Side'
      })),
      ...condiments.map((condiment, idx) => ({
        id: `condiment-${idx}-${condiment.label}`,
        name: condiment.label,
        price: condiment.price,
        category: 'Condiment'
      }))
    ];

    addItem({
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      quantity: quantity,
      modifiers,
      image: item.image
    });

    setItemQuantities({ ...itemQuantities, [item.id]: 1 });
  };

  const handleCondimentSelection = (condiments: { label: string; price: number }[]) => {
    // If we have pending meat weight data, add meat with condiments
    if (pendingMeatData) {
      const quantity = itemQuantities[pendingMeatData.item.id] || 1;

      const modifiers = [
        {
          id: `weight-${pendingMeatData.weight.label}`,
          name: pendingMeatData.weight.label,
          price: 0,
          category: 'Weight'
        },
        ...condiments.map((condiment, idx) => ({
          id: `condiment-${idx}-${condiment.label}`,
          name: condiment.label,
          price: condiment.price,
          category: 'Condiment'
        }))
      ];

      addItem({
        menuItemId: pendingMeatData.item.id,
        name: pendingMeatData.item.name,
        basePrice: pendingMeatData.weight.price,
        quantity: quantity,
        modifiers,
        image: pendingMeatData.item.image
      });

      setItemQuantities({ ...itemQuantities, [pendingMeatData.item.id]: 1 });
      setPendingMeatData(null);
    }
    // Otherwise it's a sandwich with condiments
    else if (condimentModalItem) {
      const quantity = itemQuantities[condimentModalItem.id] || 1;
      const modifiers = condiments.map((condiment, idx) => ({
        id: `condiment-${idx}-${condiment.label}`,
        name: condiment.label,
        price: condiment.price,
        category: 'Condiment'
      }));

      addItem({
        menuItemId: condimentModalItem.id,
        name: condimentModalItem.name,
        basePrice: condimentModalItem.price,
        quantity: quantity,
        modifiers,
        image: condimentModalItem.image
      });

      setItemQuantities({ ...itemQuantities, [condimentModalItem.id]: 1 });
    }
  };

  const handleFavoritesCustomization = (
    meat: { label: string; price: number } | null,
    includedToppings: { label: string; price: number; category: string }[],
    addOnToppings: { label: string; price: number; category: string }[],
    condiments: { label: string; price: number }[]
  ) => {
    if (!favoritesModalItem) return;

    const quantity = itemQuantities[favoritesModalItem.id] || 1;
    const modifiers = [
      // Add meat selection if applicable
      ...(meat ? [{
        id: `meat-${meat.label}`,
        name: meat.label,
        price: meat.price,
        category: 'Meat'
      }] : []),
      // Add included toppings (no charge)
      ...includedToppings.map((topping, idx) => ({
        id: `topping-included-${idx}-${topping.label}`,
        name: topping.label,
        price: 0.00, // Included toppings are free
        category: 'Topping'
      })),
      // Add add-on toppings (with charge)
      ...addOnToppings.map((topping, idx) => ({
        id: `topping-addon-${idx}-${topping.label}`,
        name: `Extra ${topping.label}`,
        price: topping.price,
        category: 'Add-on'
      })),
      // Add condiments
      ...condiments.map((condiment, idx) => ({
        id: `condiment-${idx}-${condiment.label}`,
        name: condiment.label,
        price: condiment.price,
        category: 'Condiment'
      }))
    ];

    addItem({
      menuItemId: favoritesModalItem.id,
      name: favoritesModalItem.name,
      basePrice: favoritesModalItem.price,
      quantity: quantity,
      modifiers,
      image: favoritesModalItem.image
    });

    setItemQuantities({ ...itemQuantities, [favoritesModalItem.id]: 1 });
  };

  const handleMeatWeightSelection = (item: MenuItem, weight: { label: string; price: number }) => {
    // Store meat weight data and close meat modal first
    setPendingMeatData({ item, weight });
    setMeatWeightModalItem(null);

    // Show condiment modal after a brief delay to ensure clean state transition
    setTimeout(() => {
      setCondimentModalItem(item);
    }, 0);
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
              WebkitTextFillColor: 'transparent'
            }}
          >
            ORDER ONLINE
          </h1>
          <p className="text-lg" style={{ color: '#F8F8F8' }}>
            Order ahead for pickup - Skip the line!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-12">
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
              {selectedCategory === 'All' ? (
                // Group by category when showing all items
                menuCategories.filter(cat => cat !== 'All').map(category => {
                  const categoryItems = filteredItems.filter(item => item.category === category);
                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={category}>
                      {/* Category Header */}
                      <h3
                        className="text-xl md:text-2xl font-bold mb-3 pb-2"
                        style={{
                          color: '#FFD700',
                          borderBottom: '2px solid rgba(255, 107, 53, 0.3)',
                          fontFamily: "'Rye', serif"
                        }}
                      >
                        {category}
                      </h3>
                      <div className="space-y-4 mb-8">
                        {categoryItems.map(item => (
                          <div
                            key={item.id}
                            className="rounded-lg overflow-hidden flex flex-row h-64"
                            style={{
                              border: '2px solid rgba(255, 107, 53, 0.3)',
                              backgroundColor: 'rgba(40, 40, 40, 0.8)'
                            }}
                          >
                            {/* Left Section - Image (60%) */}
                            <div className="w-3/5 h-full relative flex-shrink-0">
                              <Image
                                src={item.image || '/Food_Image.jpg'}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="60vw"
                              />
                            </div>

                            {/* Right Section - Content (40%) */}
                            <div className="w-2/5 p-3 flex flex-col justify-between">
                              {/* Title */}
                              <h3 className="text-base md:text-lg font-bold mb-1" style={{ color: '#FFD700' }}>
                                {item.name}
                              </h3>

                              {/* Description */}
                              <p className="text-xs mb-2" style={{ color: '#F8F8F8' }}>
                                {item.description}
                              </p>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2 mb-2">
                                <button
                                  onClick={() => updateItemQuantity(item.id, -1)}
                                  className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                                  style={{
                                    backgroundColor: 'rgba(255, 107, 53, 0.3)',
                                    border: '2px solid #FF6B35'
                                  }}
                                >
                                  <Minus className="w-3 h-3" style={{ color: '#FF6B35' }} />
                                </button>
                                <span className="text-base font-bold" style={{ color: '#F8F8F8', minWidth: '1.5rem', textAlign: 'center' }}>
                                  {itemQuantities[item.id] || 1}
                                </span>
                                <button
                                  onClick={() => updateItemQuantity(item.id, 1)}
                                  className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                                  style={{
                                    backgroundColor: 'rgba(255, 107, 53, 0.3)',
                                    border: '2px solid #FF6B35'
                                  }}
                                >
                                  <Plus className="w-3 h-3" style={{ color: '#FF6B35' }} />
                                </button>
                              </div>

                              {/* Price */}
                              <div className="text-lg md:text-xl font-bold mb-2" style={{ color: '#F8F8F8' }}>
                                ${item.price.toFixed(2)}
                              </div>

                              {/* Add to Cart Button */}
                              <button
                                onClick={() => handleAddToCart(item)}
                                className="w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105"
                                style={{
                                  background: 'linear-gradient(135deg, #FF6B35, #D32F2F)',
                                  color: '#F8F8F8',
                                  fontSize: '0.8125rem'
                                }}
                              >
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                              </button>

                              {/* In Cart Indicator */}
                              {getItemQuantityInCart(item.id) > 0 && (
                                <div className="text-xs mt-1" style={{ color: '#FFD700' }}>
                                  ({getItemQuantityInCart(item.id)} in cart)
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Show single category header when filtered
                <>
                  <h3
                    className="text-xl md:text-2xl font-bold mb-3 pb-2"
                    style={{
                      color: '#FFD700',
                      borderBottom: '2px solid rgba(255, 107, 53, 0.3)',
                      fontFamily: "'Rye', serif"
                    }}
                  >
                    {selectedCategory}
                  </h3>
                  {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="rounded-lg overflow-hidden flex flex-row h-64"
                  style={{
                    border: '2px solid rgba(255, 107, 53, 0.3)',
                    backgroundColor: 'rgba(40, 40, 40, 0.8)'
                  }}
                >
                  {/* Left Section - Image (60%) */}
                  <div className="w-3/5 h-full relative flex-shrink-0">
                    <Image
                      src={item.image || '/Food_Image.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="60vw"
                    />
                  </div>

                  {/* Right Section - Content (40%) */}
                  <div className="w-2/5 p-3 flex flex-col justify-between">
                    {/* Title */}
                    <h3 className="text-base md:text-lg font-bold mb-1" style={{ color: '#FFD700' }}>
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs mb-2" style={{ color: '#F8F8F8' }}>
                      {item.description}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => updateItemQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: 'rgba(255, 107, 53, 0.3)',
                          border: '2px solid #FF6B35'
                        }}
                      >
                        <Minus className="w-3 h-3" style={{ color: '#FF6B35' }} />
                      </button>
                      <span className="text-base font-bold" style={{ color: '#F8F8F8', minWidth: '1.5rem', textAlign: 'center' }}>
                        {itemQuantities[item.id] || 1}
                      </span>
                      <button
                        onClick={() => updateItemQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: 'rgba(255, 107, 53, 0.3)',
                          border: '2px solid #FF6B35'
                        }}
                      >
                        <Plus className="w-3 h-3" style={{ color: '#FF6B35' }} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-lg md:text-xl font-bold mb-2" style={{ color: '#F8F8F8' }}>
                      ${item.price.toFixed(2)}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #FF6B35, #D32F2F)',
                        color: '#F8F8F8',
                        fontSize: '0.8125rem'
                      }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>

                    {/* In Cart Indicator */}
                    {getItemQuantityInCart(item.id) > 0 && (
                      <div className="text-xs mt-1" style={{ color: '#FFD700' }}>
                        ({getItemQuantityInCart(item.id)} in cart)
                      </div>
                    )}
                  </div>
                </div>
              ))}
                </>
              )}
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
              <h2 className="text-xl sm:text-2xl mb-4" style={{ color: '#FFD700', fontFamily: "'Rye', serif", fontWeight: 400, letterSpacing: '0.5px' }}>
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
                          Qty: {item.quantity} × ${((item.basePrice + item.modifiers.reduce((sum, mod) => sum + mod.price, 0))).toFixed(2)}
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
                  placeholder="Any special requests? Tea, Soda, or Chip preferences?"
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
                  fontFamily: "'Rye', serif"
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

      {/* Size Selection Modal */}
      {sizeModalItem && (
        <SizeSelectionModal
          isOpen={!!sizeModalItem}
          onClose={() => setSizeModalItem(null)}
          itemName={sizeModalItem.name}
          itemImage={sizeModalItem.image}
          sizeOptions={sizeModalItem.id === 'side-fries' ? frenchFriesSizeOptions : sidesSizeOptions}
          onSelectSize={(size) => handleSizeSelection(sizeModalItem, size)}
        />
      )}

      {/* Plate Customization Modal */}
      {plateModalItem && plateConfigs[plateModalItem.id] && (
        <PlateCustomizationModal
          isOpen={!!plateModalItem}
          onClose={() => setPlateModalItem(null)}
          plateName={plateModalItem.name}
          meatCount={plateConfigs[plateModalItem.id].meatCount}
          sideCount={plateConfigs[plateModalItem.id].sideCount}
          meatOptions={meatOptions}
          sideOptions={sidesOptions}
          condimentOptions={condimentOptions}
          excludeRibs={plateConfigs[plateModalItem.id].excludeRibs}
          onComplete={(meats, sides, condiments) => handlePlateCustomization(plateModalItem, meats, sides, condiments)}
        />
      )}

      {/* Meat Weight Selection Modal */}
      {meatWeightModalItem && (
        <SizeSelectionModal
          isOpen={!!meatWeightModalItem}
          onClose={() => setMeatWeightModalItem(null)}
          itemName={meatWeightModalItem.name}
          itemImage={meatWeightModalItem.image}
          sizeOptions={meatWeightModalItem.id === 'brisket-sliced' ? premiumMeatWeightOptions : standardMeatWeightOptions}
          onSelectSize={(weight) => handleMeatWeightSelection(meatWeightModalItem, weight)}
        />
      )}

      {/* Condiment Selection Modal */}
      {condimentModalItem && (
        <CondimentSelectionModal
          isOpen={!!condimentModalItem}
          onClose={() => {
            setCondimentModalItem(null);
            setPendingMeatData(null);
          }}
          itemName={condimentModalItem.name}
          condimentOptions={condimentOptions}
          onComplete={(condiments) => handleCondimentSelection(condiments)}
        />
      )}

      {/* Favorites Customization Modal */}
      {favoritesModalItem && (
        <FavoritesCustomizationModal
          isOpen={!!favoritesModalItem}
          onClose={() => setFavoritesModalItem(null)}
          itemName={favoritesModalItem.name}
          itemId={favoritesModalItem.id}
          meatOptions={
            favoritesModalItem.id === 'wraparound'
              ? favoritesMeatOptions.filter(m =>
                  ['Hot Link', 'Jalapeno Cheddar Sausage', 'Beef Sausage'].includes(m.label)
                )
              : favoritesMeatOptions
          }
          toppingOptions={favoritesToppingOptions}
          condimentOptions={condimentOptions}
          onComplete={(meat, includedToppings, addOnToppings, condiments) =>
            handleFavoritesCustomization(meat, includedToppings, addOnToppings, condiments)}
        />
      )}
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div style={{ backgroundColor: '#1C1C1C', minHeight: '100vh' }}></div>}>
      <OrderPageContent />
    </Suspense>
  );
}