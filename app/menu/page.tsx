'use client';

import { useState } from 'react';
import Image from 'next/image';
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
    name: 'Jalapeño Sausage',
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
    description: 'Seasoned Potatoes, Jalapeño Sausage, Chopped Brisket, Sauce & Queso',
    price: 14.95,
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
    name: 'Sweet Tea',
    description: 'Southern sweet tea',
    price: 2.50,
    category: 'Extras',
    available: true,
    image: '/Assets/extra-ice-tea.jpg'
  },
  {
    id: 'soda',
    name: 'Soda',
    description: 'Coke, Pepsi, Sprite, and more',
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
    description: 'Variety of potato chips',
    price: 1.35,
    category: 'Extras',
    available: true,
    image: '/Assets/extra-chips-variety.jpg'
  },
  {
    id: 'lil-wrangler-meal',
    name: 'Lil Wrangler Meal',
    description: 'Chopped beef sandwich or Wraparound, Chips, Cookies, Capri-sun',
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
  },
  {
    id: 'wraparound',
    name: 'Wraparound',
    description: 'Wraparound',
    price: 7.25,
    category: 'Extras',
    available: true,
    image: '/Assets/extra-wraparound.png'
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
  { label: 'Jalapeño Sausage', price: 0.00 },
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
  { label: 'Jalapenos', price: 0.00 }
];

// Favorites meat options
const favoritesMeatOptions = [
  { label: 'Chopped Brisket', price: 0.00 },
  { label: 'Pulled Pork', price: 0.00 },
  { label: 'Smoked Chicken', price: 0.00 },
  { label: 'Jalapeno Sausage', price: 0.00 },
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
  'lotta-rise': { meatCount: 0, sideCount: 2 }
};

export default function MenuPage() {
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
  const { addItem } = useCartStore();

  const categories = [
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

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const handleAddToCart = (item: MenuItem) => {
    // Show size selection modal for Sides
    if (item.category === 'Sides') {
      setSizeModalItem(item);
      return;
    }

    // Show plate customization modal for Blessed Plates
    if (item.category === 'Blessed Plates' && plateConfigs[item.id]) {
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

    // Add other items directly
    addItem({
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      quantity: 1,
      modifiers: [],
      image: item.image
    });
  };

  const handleSizeSelection = (item: MenuItem, size: { label: string; price: number }) => {
    // For sides, the base price is the 4oz price (2.85)
    // We add a modifier for the selected size with appropriate price adjustment
    const baseSidePrice = 2.85;
    const modifierPrice = size.price - baseSidePrice;

    addItem({
      menuItemId: item.id,
      name: item.name,
      basePrice: baseSidePrice,
      quantity: 1,
      modifiers: [{
        id: `size-${size.label}`,
        name: size.label,
        price: modifierPrice,
        category: 'Size'
      }],
      image: item.image
    });
  };

  const handlePlateCustomization = (
    item: MenuItem,
    meats: { label: string; price: number }[],
    sides: { label: string; price: number }[],
    condiments: { label: string; price: number }[]
  ) => {
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
      quantity: 1,
      modifiers,
      image: item.image
    });
  };

  const handleCondimentSelection = (condiments: { label: string; price: number }[]) => {
    // If we have pending meat weight data, add meat with condiments
    if (pendingMeatData) {
      const baseMeatPrice = pendingMeatData.item.id === 'brisket-sliced' ? 8.95 : 5.95;
      const modifierPrice = pendingMeatData.weight.price - baseMeatPrice;

      const modifiers = [
        {
          id: `weight-${pendingMeatData.weight.label}`,
          name: pendingMeatData.weight.label,
          price: modifierPrice,
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
        basePrice: baseMeatPrice,
        quantity: 1,
        modifiers,
        image: pendingMeatData.item.image
      });

      setPendingMeatData(null);
    }
    // Otherwise it's a sandwich with condiments
    else if (condimentModalItem) {
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
        quantity: 1,
        modifiers,
        image: condimentModalItem.image
      });
    }
  };

  const handleFavoritesCustomization = (
    meat: { label: string; price: number } | null,
    includedToppings: { label: string; price: number; category: string }[],
    addOnToppings: { label: string; price: number; category: string }[],
    condiments: { label: string; price: number }[]
  ) => {
    if (!favoritesModalItem) return;

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
      quantity: 1,
      modifiers,
      image: favoritesModalItem.image
    });
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
              <div className="relative w-full aspect-[4/3] -mx-6 -mt-6 mb-4" style={{ backgroundColor: '#2a2a2a' }}>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
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
            We've figured out the secret of how smoke actually works. When we burn our oak just right,
            the smoke rises in perfect streams, opening up the meat like tiny doors,
            letting all that smoky goodness get deep inside.
          </p>
          <p className="mt-4 font-semibold" style={{ color: "#D32F2F" }}>
            "Real Smoke. Real Deep. Real Good."
          </p>
        </div>
      </div>

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
          meatOptions={favoritesMeatOptions}
          toppingOptions={favoritesToppingOptions}
          condimentOptions={condimentOptions}
          onComplete={(meat, includedToppings, addOnToppings, condiments) =>
            handleFavoritesCustomization(meat, includedToppings, addOnToppings, condiments)}
        />
      )}
    </div>
  );
}