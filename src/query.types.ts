/**
 * Type definitions for Query Builder
 * Field constraints are derived from the MappingsSchema field-type map M.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html
 */

import type {
  QueryDslMatchQuery,
  QueryDslMultiMatchQuery,
  QueryDslFuzzyQuery,
  QueryDslRegexpQuery,
  QueryDslConstantScoreQuery,
  QueryDslScriptQuery,
  QueryDslScriptScoreQuery,
  QueryDslPercolateQuery,
  QueryDslMatchPhrasePrefixQuery,
  SearchHighlightBase,
  Script
} from '@elastic/elasticsearch/lib/api/types';
import type { FieldTypeString } from './index-management.types.js';
import type {
  Infer,
  MappingsSchema,
  TextFields,
  KeywordFields,
  NumericFields,
  DateFields,
  BooleanFields,
  GeoPointFields,
  VectorFields
} from './mapping.types.js';
import type {
  AggregationBuilder,
  AggregationState
} from './aggregation.types.js';
import type { KnnOptions } from './vector.types.js';
import type { SuggesterBuilder, SuggesterState } from './suggester.types.js';

export type MatchOptions = Omit<QueryDslMatchQuery, 'query'>;
export type MultiMatchOptions = Omit<
  QueryDslMultiMatchQuery,
  'query' | 'fields'
>;
export type FuzzyOptions = Omit<QueryDslFuzzyQuery, 'value'>;
export type HighlightOptions = SearchHighlightBase;
export type RegexpOptions = Omit<QueryDslRegexpQuery, 'value'>;
export type ConstantScoreOptions = Omit<QueryDslConstantScoreQuery, 'filter'>;
export type MatchPhrasePrefixOptions = Omit<
  QueryDslMatchPhrasePrefixQuery,
  'query'
>;

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

export type ScriptOptions = Script;
export type ScriptQueryOptions = Script & Omit<QueryDslScriptQuery, 'script'>;
export type ScriptScoreOptions = Omit<
  QueryDslScriptScoreQuery,
  'query' | 'script'
>;
export type PercolateOptions = QueryDslPercolateQuery;

// ---------------------------------------------------------------------------
// Derived field groups
// ---------------------------------------------------------------------------

type TermableFields<M extends Record<string, FieldTypeString>> =
  | KeywordFields<M>
  | NumericFields<M>
  | DateFields<M>
  | BooleanFields<M>;

type RangeableFields<M extends Record<string, FieldTypeString>> =
  | NumericFields<M>
  | DateFields<M>
  | KeywordFields<M>;

type FuzzyableFields<M extends Record<string, FieldTypeString>> =
  | TextFields<M>
  | KeywordFields<M>;

// Infer value type for a field
type Val<M extends Record<string, FieldTypeString>, K extends keyof M> = Infer<
  MappingsSchema<M>
>[K];

// ---------------------------------------------------------------------------
// QueryState
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
export type QueryState<M extends Record<string, FieldTypeString>> = {
  _includeQuery?: boolean;
  query?: any;
  knn?: {
    field: string;
    query_vector: number[];
    k?: number;
    num_candidates?: number;
    filter?: any;
    boost?: number;
    similarity?: number;
  };
  aggs?: AggregationState;
  suggest?: SuggesterState;
  from?: number;
  size?: number;
  sort?: Array<Record<string, 'asc' | 'desc'>>;
  _source?: Array<string & keyof M>;
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

// ---------------------------------------------------------------------------
// ClauseBuilder
// ---------------------------------------------------------------------------

export type ClauseBuilder<M extends Record<string, FieldTypeString>> = {
  matchAll: () => any;
  match: <K extends TextFields<M> & string>(
    field: K,
    value: string,
    options?: MatchOptions
  ) => any;
  multiMatch: <K extends TextFields<M> & string>(
    fields: K[],
    value: string,
    options?: MultiMatchOptions
  ) => any;
  matchPhrase: <K extends TextFields<M> & string>(
    field: K,
    value: string
  ) => any;
  matchPhrasePrefix: <K extends TextFields<M> & string>(
    field: K,
    value: string,
    options?: MatchPhrasePrefixOptions
  ) => any;
  term: <K extends TermableFields<M> & string>(
    field: K,
    value: Val<M, K>
  ) => any;
  terms: <K extends TermableFields<M> & string>(
    field: K,
    value: Array<Val<M, K>>
  ) => any;
  range: <K extends RangeableFields<M> & string>(
    field: K,
    conditions: {
      gte?: Val<M, K>;
      lte?: Val<M, K>;
      gt?: Val<M, K>;
      lt?: Val<M, K>;
    }
  ) => any;
  exists: <K extends string & keyof M>(field: K) => any;
  prefix: <K extends KeywordFields<M> & string>(field: K, value: string) => any;
  wildcard: <K extends KeywordFields<M> & string>(
    field: K,
    value: string
  ) => any;
  fuzzy: <K extends FuzzyableFields<M> & string>(
    field: K,
    value: string,
    options?: FuzzyOptions
  ) => any;
  ids: (values: string[]) => any;
  knn: <K extends VectorFields<M> & string>(
    field: K,
    queryVector: number[],
    options: KnnOptions
  ) => any;
  script: (options: ScriptQueryOptions) => any;
  when: <R>(
    condition: any,
    thenFn: (q: ClauseBuilder<M>) => R,
    elseFn?: (q: ClauseBuilder<M>) => R
  ) => R | undefined;
};

// ---------------------------------------------------------------------------
// QueryBuilder
// ---------------------------------------------------------------------------

export type QueryBuilder<M extends Record<string, FieldTypeString>> = {
  bool: () => QueryBuilder<M>;
  must: (fn: (q: ClauseBuilder<M>) => any) => QueryBuilder<M>;
  mustNot: (fn: (q: ClauseBuilder<M>) => any) => QueryBuilder<M>;
  should: (fn: (q: ClauseBuilder<M>) => any) => QueryBuilder<M>;
  filter: (fn: (q: ClauseBuilder<M>) => any) => QueryBuilder<M>;
  minimumShouldMatch: (n: number) => QueryBuilder<M>;

  matchAll: () => QueryBuilder<M>;
  match: <K extends TextFields<M> & string>(
    field: K,
    value: string,
    options?: MatchOptions
  ) => QueryBuilder<M>;
  multiMatch: <K extends TextFields<M> & string>(
    fields: K[],
    value: string,
    options?: MultiMatchOptions
  ) => QueryBuilder<M>;
  matchPhrase: <K extends TextFields<M> & string>(
    field: K,
    value: string
  ) => QueryBuilder<M>;
  matchPhrasePrefix: <K extends TextFields<M> & string>(
    field: K,
    value: string,
    options?: MatchPhrasePrefixOptions
  ) => QueryBuilder<M>;

  term: <K extends TermableFields<M> & string>(
    field: K,
    value: Val<M, K>
  ) => QueryBuilder<M>;
  terms: <K extends TermableFields<M> & string>(
    field: K,
    values: Array<Val<M, K>>
  ) => QueryBuilder<M>;
  range: <K extends RangeableFields<M> & string>(
    field: K,
    conditions: {
      gte?: Val<M, K>;
      lte?: Val<M, K>;
      gt?: Val<M, K>;
      lt?: Val<M, K>;
    }
  ) => QueryBuilder<M>;
  exists: (field: string & keyof M) => QueryBuilder<M>;
  prefix: <K extends KeywordFields<M> & string>(
    field: K,
    value: string
  ) => QueryBuilder<M>;
  wildcard: <K extends KeywordFields<M> & string>(
    field: K,
    value: string
  ) => QueryBuilder<M>;
  fuzzy: <K extends FuzzyableFields<M> & string>(
    field: K,
    value: string,
    options?: FuzzyOptions
  ) => QueryBuilder<M>;
  ids: (values: string[]) => QueryBuilder<M>;
  nested: (
    path: string,
    fn: (q: ClauseBuilder<any>) => any,
    options?: { score_mode?: 'avg' | 'sum' | 'min' | 'max' | 'none' }
  ) => QueryBuilder<M>;

  knn: <K extends VectorFields<M> & string>(
    field: K,
    queryVector: number[],
    options: KnnOptions
  ) => QueryBuilder<M>;

  script: (options: ScriptQueryOptions) => QueryBuilder<M>;
  scriptScore: (
    query: (q: ClauseBuilder<M>) => any,
    script: ScriptOptions,
    options?: ScriptScoreOptions
  ) => QueryBuilder<M>;
  percolate: (options: PercolateOptions) => QueryBuilder<M>;

  when: <R>(
    condition: any,
    thenFn: (q: QueryBuilder<M>) => R,
    elseFn?: (q: QueryBuilder<M>) => R
  ) => R | undefined;

  aggs: (
    fn: (agg: AggregationBuilder<M>) => AggregationBuilder<M>
  ) => QueryBuilder<M>;

  suggest: (
    fn: (s: SuggesterBuilder<M>) => SuggesterBuilder<M>
  ) => QueryBuilder<M>;

  sort: <K extends string & keyof M>(
    field: K,
    direction: 'asc' | 'desc'
  ) => QueryBuilder<M>;
  from: (from: number) => QueryBuilder<M>;
  size: (size: number) => QueryBuilder<M>;
  _source: (fields: Array<string & keyof M>) => QueryBuilder<M>;
  timeout: (timeout: string) => QueryBuilder<M>;
  trackScores: (track: boolean) => QueryBuilder<M>;
  explain: (explain: boolean) => QueryBuilder<M>;
  minScore: (score: number) => QueryBuilder<M>;
  version: (version: boolean) => QueryBuilder<M>;
  seqNoPrimaryTerm: (enabled: boolean) => QueryBuilder<M>;
  trackTotalHits: (value: boolean | number) => QueryBuilder<M>;
  highlight: (
    fields: Array<string & keyof M>,
    options?: HighlightOptions
  ) => QueryBuilder<M>;

  geoDistance: <K extends GeoPointFields<M> & string>(
    field: K,
    center: { lat: number; lon: number },
    options: GeoDistanceOptions
  ) => QueryBuilder<M>;
  geoBoundingBox: <K extends GeoPointFields<M> & string>(
    field: K,
    options: GeoBoundingBoxOptions
  ) => QueryBuilder<M>;
  geoPolygon: <K extends GeoPointFields<M> & string>(
    field: K,
    options: GeoPolygonOptions
  ) => QueryBuilder<M>;

  regexp: <K extends KeywordFields<M> & string>(
    field: K,
    value: string,
    options?: RegexpOptions
  ) => QueryBuilder<M>;
  constantScore: (
    fn: (q: ClauseBuilder<M>) => any,
    options?: ConstantScoreOptions
  ) => QueryBuilder<M>;

  build: () => QueryState<M>;
};
/* eslint-enable @typescript-eslint/no-explicit-any */
