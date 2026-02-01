/* eslint-disable @typescript-eslint/no-explicit-any */
import { AggregationBuilder, AggregationState } from './aggregation-types';

export type MatchOptions = {
  operator?: 'and' | 'or';
  fuzziness?: string | number;
  boost?: number;
  analyzer?: string;
  zero_terms_query?: 'none' | 'all';
};

export type MultiMatchOptions = {
  type?:
    | 'best_fields'
    | 'most_fields'
    | 'cross_fields'
    | 'phrase'
    | 'phrase_prefix'
    | 'bool_prefix';
  operator?: 'and' | 'or';
  tie_breaker?: number;
  boost?: number;
};

export type FuzzyOptions = {
  fuzziness?: string | number;
  boost?: number;
};

export type HighlightOptions = {
  fragment_size?: number;
  number_of_fragments?: number;
  pre_tags?: string[];
  post_tags?: string[];
};

export type RegexpOptions = {
  flags?: string;
  max_determinized_states?: number;
  boost?: number;
};

export type ConstantScoreOptions = {
  boost?: number;
};

export type GeoDistanceOptions = {
  distance: string | number;
  unit?: 'mi' | 'km' | 'mm' | 'cm' | 'm' | 'yd' | 'ft' | 'in' | 'nmi';
  distance_type?: 'arc' | 'plane';
};

export type GeoBoundingBoxOptions = {
  top_left?: { lat: number; lon: number };
  bottom_right?: { lat: number; lon: number };
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
};

export type GeoPolygonOptions = {
  points: Array<{ lat: number; lon: number }>;
};

export type QueryState<T> = {
  _includeQuery?: boolean;
  query?: any;
  aggs?: AggregationState;
  from?: number;
  to?: number;
  size?: number;
  sort?: Array<{ [K in keyof T]: 'asc' | 'desc' }>;
  _source?: Array<keyof T>;
  timeout?: string;
  track_scores?: boolean;
  explain?: boolean;
  min_score?: number;
  version?: boolean;
  seq_no_primary_term?: boolean;
  track_total_hits?: boolean | number;
  highlight?: {
    fields: Record<string, HighlightOptions>;
    pre_tags?: string[];
    post_tags?: string[];
  };
};

export type ClauseBuilder<T> = {
  matchAll: () => any;
  match: <K extends keyof T>(
    field: K,
    value: T[K],
    options?: MatchOptions
  ) => any;
  multiMatch: <K extends keyof T>(
    fields: K[],
    value: string,
    options?: MultiMatchOptions
  ) => any;
  matchPhrase: <K extends keyof T>(field: K, value: T[K]) => any;
  matchPhrasePrefix: <K extends keyof T>(
    field: K,
    value: T[K],
    options?: { max_expansions?: number }
  ) => any;
  term: <K extends keyof T>(field: K, value: T[K]) => any;
  terms: <K extends keyof T>(field: K, value: T[K]) => any;
  range: <K extends keyof T>(
    field: K,
    conditions: { gte?: T[K]; lte?: T[K]; gt?: T[K]; lt?: T[K] }
  ) => any;
  exists: <K extends keyof T>(field: K) => any;
  prefix: <K extends keyof T>(field: K, value: string) => any;
  wildcard: <K extends keyof T>(field: K, value: string) => any;
  fuzzy: <K extends keyof T>(
    field: K,
    value: string,
    options?: FuzzyOptions
  ) => any;
  ids: (values: string[]) => any;
  when: <R>(
    condition: any,
    thenFn: (q: ClauseBuilder<T>) => R,
    elseFn?: (q: ClauseBuilder<T>) => R
  ) => R | undefined;
};

export type QueryBuilder<T> = {
  bool: () => QueryBuilder<T>;
  must: (fn: (q: ClauseBuilder<T>) => any) => QueryBuilder<T>;
  mustNot: (fn: (q: ClauseBuilder<T>) => any) => QueryBuilder<T>;
  should: (fn: (q: ClauseBuilder<T>) => any) => QueryBuilder<T>;
  filter: (fn: (q: ClauseBuilder<T>) => any) => QueryBuilder<T>;
  minimumShouldMatch: (n: number) => QueryBuilder<T>;
  // Full-text queries
  matchAll: () => QueryBuilder<T>;
  match: <K extends keyof T>(
    field: K,
    value: T[K],
    options?: MatchOptions
  ) => QueryBuilder<T>;
  multiMatch: <K extends keyof T>(
    fields: K[],
    value: string,
    options?: MultiMatchOptions
  ) => QueryBuilder<T>;
  matchPhrase: <K extends keyof T>(field: K, value: T[K]) => QueryBuilder<T>;
  matchPhrasePrefix: <K extends keyof T>(
    field: K,
    value: T[K],
    options?: { max_expansions?: number }
  ) => QueryBuilder<T>;
  // queryString TBD
  // Term-level queries
  term: <K extends keyof T>(field: K, value: T[K]) => QueryBuilder<T>;
  terms: <K extends keyof T>(field: K, values: T[K][]) => QueryBuilder<T>;
  range: <K extends keyof T>(
    field: K,
    conditions: { gte?: T[K]; lte?: T[K]; gt?: T[K]; lt?: T[K] }
  ) => QueryBuilder<T>;
  exists: (field: keyof T) => QueryBuilder<T>;
  prefix: <K extends keyof T>(field: K, value: string) => QueryBuilder<T>;
  wildcard: <K extends keyof T>(field: K, value: string) => QueryBuilder<T>;
  fuzzy: <K extends keyof T>(
    field: K,
    value: string,
    options?: FuzzyOptions
  ) => QueryBuilder<T>;
  ids: (values: string[]) => QueryBuilder<T>;
  nested: <P extends keyof T>(
    path: P,
    fn: (q: ClauseBuilder<any>) => any,
    options?: { score_mode?: 'avg' | 'sum' | 'min' | 'max' | 'none' }
  ) => QueryBuilder<T>;
  // Conditionals
  when: <R>(
    condition: any,
    thenFn: (q: QueryBuilder<T>) => R,
    elseFn?: (q: QueryBuilder<T>) => R
  ) => R | undefined;
  aggs: (
    fn: (agg: AggregationBuilder<T>) => AggregationBuilder<T>
  ) => QueryBuilder<T>;
  // Meta
  sort: <K extends keyof T>(
    field: K,
    direction: 'asc' | 'desc'
  ) => QueryBuilder<T>;
  from: (from: number) => QueryBuilder<T>;
  to: (to: number) => QueryBuilder<T>;
  size: (size: number) => QueryBuilder<T>;
  _source: (fields: Array<keyof T>) => QueryBuilder<T>;
  timeout: (timeout: string) => QueryBuilder<T>;
  trackScores: (track: boolean) => QueryBuilder<T>;
  explain: (explain: boolean) => QueryBuilder<T>;
  minScore: (score: number) => QueryBuilder<T>;
  version: (version: boolean) => QueryBuilder<T>;
  seqNoPrimaryTerm: (enabled: boolean) => QueryBuilder<T>;
  trackTotalHits: (value: boolean | number) => QueryBuilder<T>;
  highlight: (
    fields: Array<keyof T>,
    options?: HighlightOptions
  ) => QueryBuilder<T>;
  // Geo queries
  geoDistance: <K extends keyof T>(
    field: K,
    center: { lat: number; lon: number },
    options: GeoDistanceOptions
  ) => QueryBuilder<T>;
  geoBoundingBox: <K extends keyof T>(
    field: K,
    options: GeoBoundingBoxOptions
  ) => QueryBuilder<T>;
  geoPolygon: <K extends keyof T>(
    field: K,
    options: GeoPolygonOptions
  ) => QueryBuilder<T>;
  // Pattern and scoring queries
  regexp: <K extends keyof T>(
    field: K,
    value: string,
    options?: RegexpOptions
  ) => QueryBuilder<T>;
  constantScore: (
    fn: (q: ClauseBuilder<T>) => any,
    options?: ConstantScoreOptions
  ) => QueryBuilder<T>;
  build: () => QueryState<T>;
};
