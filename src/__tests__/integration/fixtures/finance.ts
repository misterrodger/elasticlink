import { mappings, text, keyword, integer, float, date, boolean } from '../../../index.js';
import type { Infer } from '../../../index.js';

export const instrumentMappings = mappings({
  name: text(),
  asset_class: keyword(),
  sector: keyword(),
  tags: keyword(),
  price: integer(),
  yield_rate: float(),
  active: boolean(),
  listed_date: date()
});

export type Instrument = Infer<typeof instrumentMappings>;

export const INSTRUMENTS = [
  {
    name: 'US Treasury 10-Year Note',
    asset_class: 'fixed-income',
    sector: 'government',
    tags: ['sovereign', 'investment-grade', 'liquid'],
    price: 98,
    yield_rate: 4.3,
    active: true,
    listed_date: '2023-02-15'
  },
  {
    name: 'Investment Grade Corporate Bond ETF',
    asset_class: 'fixed-income',
    sector: 'corporate',
    tags: ['etf', 'investment-grade', 'diversified'],
    price: 112,
    yield_rate: 5.1,
    active: true,
    listed_date: '2023-07-01'
  },
  {
    name: 'Emerging Market Equity Fund',
    asset_class: 'equity',
    sector: 'emerging-markets',
    tags: ['high-risk', 'growth', 'diversified'],
    price: 54,
    yield_rate: 2.8,
    active: false,
    listed_date: '2022-09-12'
  },
  {
    name: 'S&P 500 Index Fund',
    asset_class: 'equity',
    sector: 'broad-market',
    tags: ['index', 'sp500', 'liquid'],
    price: 479,
    yield_rate: 1.5,
    active: true,
    listed_date: '2021-03-22'
  }
];

export const tradeMappings = mappings({
  reference: text(),
  status: keyword(),
  priority: integer()
});

export type Trade = Infer<typeof tradeMappings>;
