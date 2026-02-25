import {
  mappings,
  keyword,
  text,
  long,
  float,
  date,
  denseVector
} from '../../index.js';
import type { Infer } from '../../index.js';

export const instrumentMappings = mappings({
  isin: keyword(),
  name: text(),
  asset_class: keyword(),
  market_cap: long(),
  sector: keyword(),
  tags: keyword(),
  listed_date: date(),
  credit_rating: float()
});

export type Instrument = Infer<typeof instrumentMappings>;

export const instrumentWithEmbeddingMappings = mappings({
  isin: keyword(),
  name: text(),
  asset_class: keyword(),
  market_cap: long(),
  sector: keyword(),
  tags: keyword(),
  listed_date: date(),
  credit_rating: float(),
  embedding: denseVector({ dims: 384 }),
  prospectus_url: keyword(),
  address: text(),
  list_price: float(),
  property_class: keyword(),
  description: text()
});

export type InstrumentWithEmbedding = Infer<
  typeof instrumentWithEmbeddingMappings
>;

export const scoredInstrumentMappings = mappings({
  isin: keyword(),
  name: text(),
  asset_class: keyword(),
  market_cap: long(),
  sector: keyword(),
  tags: keyword(),
  listed_date: date(),
  credit_rating: float(),
  list_price: float(),
  address: text(),
  property_class: keyword(),
  description: text()
});

export type ScoredInstrument = Infer<typeof scoredInstrumentMappings>;

export const INSTRUMENTS: Instrument[] = [
  {
    isin: 'US0378331005',
    name: 'Apple Inc',
    asset_class: 'equity',
    market_cap: 3_100_000_000_000,
    sector: 'technology',
    tags: 'large-cap',
    listed_date: '1980-12-12',
    credit_rating: 4.8
  },
  {
    isin: 'US38259P5089',
    name: 'Alphabet Inc',
    asset_class: 'equity',
    market_cap: 1_900_000_000_000,
    sector: 'technology',
    tags: 'large-cap',
    listed_date: '2004-08-19',
    credit_rating: 4.6
  },
  {
    isin: 'US4592001014',
    name: 'IBM Corp',
    asset_class: 'equity',
    market_cap: 160_000_000_000,
    sector: 'technology',
    tags: 'dividend',
    listed_date: '1916-01-01',
    credit_rating: 3.9
  }
];
