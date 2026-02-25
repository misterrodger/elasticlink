import { mappings, text, keyword, integer } from '../../../index.js';
import type { Infer } from '../../../index.js';

export const listingMappings = mappings({
  address: text(),
  property_class: keyword(),
  list_price: integer()
});

export type Listing = Infer<typeof listingMappings>;

export const LISTINGS = [
  {
    address: '200 Harbor View Dr, Unit 12A',
    property_class: 'condo',
    list_price: 1_250_000
  },
  {
    address: '845 Park Avenue, Apt 8B',
    property_class: 'condo',
    list_price: 2_100_000
  },
  {
    address: '12 Park Terrace',
    property_class: 'townhouse',
    list_price: 3_100_000
  },
  {
    address: '500 Riverside Drive',
    property_class: 'townhouse',
    list_price: 4_800_000
  }
];
