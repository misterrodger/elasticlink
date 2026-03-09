import { mappings, keyword, text, float, object, nested } from '../../index.js';
import type { Infer } from '../../index.js';

export const deepObjectMappings = mappings({
  name: text(),
  address: object({
    billing: object({ city: keyword(), zip: keyword() }),
    shipping: object({ city: keyword(), country: keyword() })
  })
});

export type DeepObjectDoc = Infer<typeof deepObjectMappings>;

export const deepNestedMappings = mappings({
  title: text(),
  shipments: nested({
    tracking: keyword(),
    price: float(),
    address: object({ city: keyword(), country: keyword() })
  })
});

export type DeepNestedDoc = Infer<typeof deepNestedMappings>;

export const DEEP_OBJECT_DOCS: DeepObjectDoc[] = [
  {
    name: 'Widget A',
    address: {
      billing: { city: 'Austin', zip: '78701' },
      shipping: { city: 'Dallas', country: 'US' }
    }
  },
  {
    name: 'Widget B',
    address: {
      billing: { city: 'Portland', zip: '97201' },
      shipping: { city: 'Seattle', country: 'US' }
    }
  },
  {
    name: 'Widget C',
    address: {
      billing: { city: 'London', zip: 'EC1A 1BB' },
      shipping: { city: 'Berlin', country: 'DE' }
    }
  }
];

export const DEEP_NESTED_DOCS: DeepNestedDoc[] = [
  {
    title: 'Order 1',
    shipments: [
      { tracking: 'TRK-001', price: 49.99, address: { city: 'London', country: 'GB' } },
      { tracking: 'TRK-002', price: 149.99, address: { city: 'Berlin', country: 'DE' } }
    ]
  },
  {
    title: 'Order 2',
    shipments: [{ tracking: 'TRK-003', price: 89.99, address: { city: 'Paris', country: 'FR' } }]
  }
];
