export type Instrument = {
  isin: string;
  name: string;
  asset_class: string;
  market_cap: number;
  sector: string;
  tags: string[];
  listed_date: string;
  credit_rating: number;
};

export type InstrumentWithEmbedding = Instrument & {
  embedding: number[];
  prospectus_url: string;
  address: string;
  list_price: number;
  property_class: string;
  description: string;
};

export type ScoredInstrument = Instrument & {
  list_price: number;
  address: string;
  property_class: string;
  description: string;
};

export const INSTRUMENTS: Instrument[] = [
  {
    isin: 'US0378331005',
    name: 'Apple Inc',
    asset_class: 'equity',
    market_cap: 3_100_000_000_000,
    sector: 'technology',
    tags: ['large-cap', 'sp500'],
    listed_date: '1980-12-12',
    credit_rating: 4.8
  },
  {
    isin: 'US38259P5089',
    name: 'Alphabet Inc',
    asset_class: 'equity',
    market_cap: 1_900_000_000_000,
    sector: 'technology',
    tags: ['large-cap', 'sp500'],
    listed_date: '2004-08-19',
    credit_rating: 4.6
  },
  {
    isin: 'US4592001014',
    name: 'IBM Corp',
    asset_class: 'equity',
    market_cap: 160_000_000_000,
    sector: 'technology',
    tags: ['dividend', 'sp500'],
    listed_date: '1916-01-01',
    credit_rating: 3.9
  }
];
