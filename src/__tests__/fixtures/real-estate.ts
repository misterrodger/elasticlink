export type Listing = {
  property_class: string;
  address: string;
  list_price: number;
  sqft: number;
};

export type ListingDetail = Listing & {
  location: { lat: number; lon: number };
  listed_date: string;
  embedding: number[];
  title: string;
  description: string;
  cap_rate: number;
};

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
