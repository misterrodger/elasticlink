import {
  mappings,
  keyword,
  text,
  float,
  integer,
  boolean,
  object,
  nested,
  denseVector,
  sparseVector,
  rankFeature,
  rankFeatures,
  date,
  geoPoint
} from '../../index.js';
import type { Infer } from '../../index.js';

/**
 * E-commerce product schema — demonstrates both `object()` and `nested()` field types.
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

export const vectorProductMappings = mappings({
  title: keyword(),
  category: keyword(),
  embedding: denseVector({ dims: 3, similarity: 'cosine' })
});

export type VectorProduct = Infer<typeof vectorProductMappings>;

export const searchProductMappings = mappings({
  name: text(),
  slug: keyword(),
  listed_at: date(),
  store_location: geoPoint(),
  ml_tokens: sparseVector(),
  popularity: rankFeature(),
  category_scores: rankFeatures(),
  embedding: denseVector({ dims: 4 })
});

export type SearchProduct = Infer<typeof searchProductMappings>;
