import { mappings, keyword, text, long, float, boolean, date, denseVector, integer } from '../../index.js';
import type { Infer } from '../../index.js';

export const instrumentMappings = mappings({
  isin: keyword(),
  name: text(),
  asset_class: keyword(),
  sector: keyword(),
  tags: keyword(),
  market_cap: long(),
  listed_date: date(),
  credit_rating: float(),
  yield_rate: float(),
  active: boolean()
});

export type Instrument = Infer<typeof instrumentMappings>;

export const INSTRUMENT_EMBEDDING_DIMS = 384;

export const instrumentWithEmbeddingMappings = mappings({
  isin: keyword(),
  name: text(),
  asset_class: keyword(),
  sector: keyword(),
  tags: keyword(),
  market_cap: long(),
  listed_date: date(),
  credit_rating: float(),
  yield_rate: float(),
  active: boolean(),
  embedding: denseVector({ dims: INSTRUMENT_EMBEDDING_DIMS })
});

export type InstrumentWithEmbedding = Infer<typeof instrumentWithEmbeddingMappings>;

export const tradeMappings = mappings({
  reference: text(),
  status: keyword(),
  priority: integer()
});

export type Trade = Infer<typeof tradeMappings>;
