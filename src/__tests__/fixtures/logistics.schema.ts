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
