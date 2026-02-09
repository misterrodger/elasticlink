export type Listing = {
  address: string;
  property_class: string;
  list_price: number;
};

export const LISTINGS: Listing[] = [
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
