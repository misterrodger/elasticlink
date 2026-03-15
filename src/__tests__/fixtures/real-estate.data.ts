import type { Listing } from './real-estate.schema.js';

export const LISTINGS: Listing[] = [
  {
    property_class: 'condo',
    address: '200 Harbor View Dr, Unit 12A',
    list_price: 1_250_000,
    sqft: 1100
  },
  {
    property_class: 'condo',
    address: '845 Park Avenue, Apt 8B',
    list_price: 2_100_000,
    sqft: 1650
  },
  {
    property_class: 'townhouse',
    address: '12 Park Terrace',
    list_price: 3_100_000,
    sqft: 2800
  },
  {
    property_class: 'townhouse',
    address: '88 Riverside Drive',
    list_price: 4_800_000,
    sqft: 3600
  },
  {
    property_class: 'single-family',
    address: '14 Elmwood Lane',
    list_price: 8_500_000,
    sqft: 5200
  }
];
