import { INSTRUMENT_EMBEDDING_DIMS, type Instrument, type InstrumentWithEmbedding } from './finance.schema.js';

export const INSTRUMENTS: Instrument[] = [
  {
    isin: 'US0378331005',
    name: 'Apple Inc',
    asset_class: 'equity',
    sector: 'technology',
    tags: 'large-cap',
    market_cap: 3_100_000_000_000,
    listed_date: '1980-12-12',
    credit_rating: 4.8,
    yield_rate: 0.5,
    active: true
  },
  {
    isin: 'US912810TM07',
    name: 'US Treasury 10-Year Note',
    asset_class: 'fixed-income',
    sector: 'government',
    tags: 'sovereign',
    market_cap: 1_000_000_000_000,
    listed_date: '2023-02-15',
    credit_rating: 5,
    yield_rate: 4.3,
    active: true
  },
  {
    isin: 'US46434G8473',
    name: 'Investment Grade Corporate Bond Fund',
    asset_class: 'fixed-income',
    sector: 'corporate',
    tags: 'investment-grade',
    market_cap: 50_000_000_000,
    listed_date: '2023-07-01',
    credit_rating: 4.1,
    yield_rate: 5.1,
    active: true
  },
  {
    isin: 'US78462F1030',
    name: 'S&P 500 Index Fund',
    asset_class: 'equity',
    sector: 'broad-market',
    tags: 'index',
    market_cap: 400_000_000_000,
    listed_date: '2021-03-22',
    credit_rating: 4.2,
    yield_rate: 1.5,
    active: true
  }
];

export const INSTRUMENT_WITH_EMBEDDINGS: InstrumentWithEmbedding[] = [
  {
    isin: 'US0378331005',
    name: 'Apple Inc',
    asset_class: 'equity',
    sector: 'technology',
    tags: 'large-cap',
    market_cap: 3_100_000_000_000,
    listed_date: '1980-12-12',
    credit_rating: 4.8,
    yield_rate: 0.5,
    active: true,
    embedding: Array.from({ length: INSTRUMENT_EMBEDDING_DIMS }, (_, i) => (i === 0 ? 1 : 0))
  }
];
