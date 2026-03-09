import { mappings, keyword, text, float, integer, boolean, object, nested } from '../../index.js';
import type { Infer } from '../../index.js';

/**
 * E-commerce product schema — demonstrates both `object()` and `nested()` field types.
 *
 * `address` uses `object()`: a single structured value queried with dot-notation.
 * `variants` uses `nested()`: an array of objects where per-variant field relationships matter.
 */
export const productMappings = mappings({
  name: text(),
  description: text(),
  category: keyword(),
  brand: keyword(),
  in_stock: boolean(),
  address: object({
    street: text(),
    city: keyword(),
    country: keyword(),
    zip: keyword()
  }),
  variants: nested({
    sku: keyword(),
    color: keyword(),
    size: keyword(),
    price: float(),
    stock: integer()
  })
});

export type Product = Infer<typeof productMappings>;

export const PRODUCTS: Product[] = [
  {
    name: 'Running Shoe',
    description: 'Lightweight everyday trainer',
    category: 'footwear',
    brand: 'Pace',
    in_stock: true,
    address: { street: '1 Main St', city: 'Portland', country: 'US', zip: '97201' },
    variants: [
      { sku: 'RS-BLK-10', color: 'black', size: '10', price: 119.99, stock: 12 },
      { sku: 'RS-WHT-10', color: 'white', size: '10', price: 119.99, stock: 0 }
    ]
  },
  {
    name: 'Trail Boot',
    description: 'Waterproof hiking boot',
    category: 'footwear',
    brand: 'Summit',
    in_stock: true,
    address: { street: '42 Oak Ave', city: 'Seattle', country: 'US', zip: '98101' },
    variants: [
      { sku: 'TB-BRN-9', color: 'brown', size: '9', price: 189.99, stock: 5 },
      { sku: 'TB-BLK-9', color: 'black', size: '9', price: 189.99, stock: 3 }
    ]
  }
];
