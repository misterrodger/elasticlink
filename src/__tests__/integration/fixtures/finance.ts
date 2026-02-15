export type Instrument = {
  name: string;
  asset_class: string;
  sector: string;
  tags: string[];
  price: number;
  yield_rate: number;
  active: boolean;
  listed_date: string;
};

export const INSTRUMENTS: Instrument[] = [
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

export type Trade = {
  reference: string;
  status: string;
  priority: number;
};
