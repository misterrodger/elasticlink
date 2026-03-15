import { mappings, keyword, text, long, float, date, geoPoint, geoShape, denseVector } from '../../index.js';
import type { Infer } from '../../index.js';

export const listingMappings = mappings({
  property_class: keyword(),
  address: text(),
  list_price: long(),
  sqft: long()
});

export type Listing = Infer<typeof listingMappings>;

export const listingDetailMappings = mappings({
  property_class: keyword(),
  address: text(),
  list_price: long(),
  sqft: long(),
  location: geoPoint(),
  listed_date: date(),
  embedding: denseVector({ dims: 384 }),
  title: text(),
  description: text(),
  cap_rate: float()
});

export type ListingDetail = Infer<typeof listingDetailMappings>;

export const geoListingMappings = mappings({
  address: text(),
  property_class: keyword(),
  boundary: geoShape()
});

export type GeoListing = Infer<typeof geoListingMappings>;
