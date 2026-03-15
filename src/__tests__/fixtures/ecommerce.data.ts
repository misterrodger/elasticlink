import type { Product, VectorProduct } from './ecommerce.schema.js';

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

export const VECTOR_PRODUCTS: VectorProduct[] = [
  { title: 'alpha', category: 'a', embedding: [1, 0, 0] },
  { title: 'beta', category: 'b', embedding: [0, 1, 0] },
  { title: 'gamma', category: 'a', embedding: [0, 0, 1] },
  { title: 'delta', category: 'b', embedding: [0.707, 0.707, 0] }
];
