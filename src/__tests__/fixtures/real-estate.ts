import { mappings, keyword, text, float, long, date, geoPoint, denseVector } from '../../index.js';
import type { Infer } from '../../index.js';

export const listingMappings = mappings({
  property_class: keyword(),
  address: text(),
  list_price: float(),
  sqft: long()
});

export type Listing = Infer<typeof listingMappings>;

export const listingDetailMappings = mappings({
  property_class: keyword(),
  address: text(),
  list_price: float(),
  sqft: long(),
  location: geoPoint(),
  listed_date: date(),
  embedding: denseVector({ dims: 384 }),
  title: text(),
  description: text(),
  cap_rate: float()
});

export type ListingDetail = Infer<typeof listingDetailMappings>;

export const LISTINGS: Listing[] = [
  {
    property_class: 'condo',
    address: '200 Harbor View Dr',
    list_price: 1_250_000,
    sqft: 1100
  },
  {
    property_class: 'co-op',
    address: '845 Park Avenue',
    list_price: 2_400_000,
    sqft: 1850
  },
  {
    property_class: 'townhouse',
    address: '12 Park Terrace',
    list_price: 3_100_000,
    sqft: 2800
  }
];
