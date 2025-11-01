// Shipping Configuration for Rise N' Smoke BBQ
// FedEx 2-Day Express with Insulated Packaging + Dry Ice

export interface ShippingZone {
  name: string;
  states: string[];
  rate: number;
  transitDays: number;
}

export interface PackagingFees {
  insulatedBox: number;
  dryIce: number;
  handlingFee: number;
}

// FedEx 2-Day Shipping Zones (Flat Rates)
export const SHIPPING_ZONES: ShippingZone[] = [
  {
    name: 'Local Zone (Texas)',
    states: ['TX'],
    rate: 25.00,
    transitDays: 2
  },
  {
    name: 'Regional Zone (Surrounding States)',
    states: ['OK', 'LA', 'AR', 'NM', 'CO', 'KS', 'MO'],
    rate: 35.00,
    transitDays: 2
  },
  {
    name: 'Central Zone',
    states: ['MS', 'AL', 'TN', 'KY', 'IL', 'IN', 'OH', 'WI', 'MI', 'IA', 'MN', 'ND', 'SD', 'NE', 'WY', 'MT', 'ID'],
    rate: 45.00,
    transitDays: 2
  },
  {
    name: 'Eastern Zone',
    states: ['FL', 'GA', 'SC', 'NC', 'VA', 'WV', 'MD', 'DE', 'PA', 'NJ', 'NY', 'CT', 'RI', 'MA', 'VT', 'NH', 'ME'],
    rate: 55.00,
    transitDays: 2
  },
  {
    name: 'Western Zone',
    states: ['AZ', 'UT', 'NV', 'CA', 'OR', 'WA'],
    rate: 65.00,
    transitDays: 2
  },
  {
    name: 'Alaska & Hawaii',
    states: ['AK', 'HI'],
    rate: 95.00,
    transitDays: 3
  }
];

// Packaging & Handling Fees
export const PACKAGING_FEES: PackagingFees = {
  insulatedBox: 10.00,    // Insulated cooler box
  dryIce: 15.00,          // Dry ice for 2-day cold chain
  handlingFee: 5.00       // Additional handling/packaging
};

// Minimum order for shipping
export const MINIMUM_SHIPPING_ORDER = 50.00;

// Calculate shipping cost based on state
export function calculateShippingCost(state: string): {
  shippingRate: number;
  packagingFees: number;
  totalShipping: number;
  zoneName: string;
  transitDays: number;
} | null {
  const zone = SHIPPING_ZONES.find(z => z.states.includes(state.toUpperCase()));

  if (!zone) {
    return null; // State not serviceable
  }

  const packagingTotal = PACKAGING_FEES.insulatedBox + PACKAGING_FEES.dryIce + PACKAGING_FEES.handlingFee;

  return {
    shippingRate: zone.rate,
    packagingFees: packagingTotal,
    totalShipping: zone.rate + packagingTotal,
    zoneName: zone.name,
    transitDays: zone.transitDays
  };
}

// Get shipping zone info by state
export function getShippingZone(state: string): ShippingZone | null {
  return SHIPPING_ZONES.find(z => z.states.includes(state.toUpperCase())) || null;
}

// Validate if state is serviceable
export function isStateServiceable(state: string): boolean {
  return SHIPPING_ZONES.some(z => z.states.includes(state.toUpperCase()));
}

// Get all serviceable states
export function getServiceableStates(): string[] {
  return SHIPPING_ZONES.flatMap(z => z.states);
}

// Calculate estimated delivery date
export function getEstimatedDeliveryDate(state: string, orderDate: Date = new Date()): Date | null {
  const zone = getShippingZone(state);
  if (!zone) return null;

  const deliveryDate = new Date(orderDate);

  // Add transit days
  deliveryDate.setDate(deliveryDate.getDate() + zone.transitDays);

  // Skip weekends for delivery
  while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  }

  return deliveryDate;
}

// Format delivery date
export function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Get next available ship date (ship Mon-Wed for FedEx 2-day)
export function getNextShipDate(fromDate: Date = new Date()): Date {
  const shipDate = new Date(fromDate);
  const dayOfWeek = shipDate.getDay();

  // If it's Thursday (4), Friday (5), Saturday (6), or Sunday (0), move to Monday
  if (dayOfWeek === 0) {
    shipDate.setDate(shipDate.getDate() + 1); // Sunday -> Monday
  } else if (dayOfWeek === 4) {
    shipDate.setDate(shipDate.getDate() + 4); // Thursday -> Monday
  } else if (dayOfWeek === 5) {
    shipDate.setDate(shipDate.getDate() + 3); // Friday -> Monday
  } else if (dayOfWeek === 6) {
    shipDate.setDate(shipDate.getDate() + 2); // Saturday -> Monday
  }

  return shipDate;
}

// US States list
export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];
