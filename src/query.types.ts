/**
 * Type definitions for Query Builder
 * Derived from official @elastic/elasticsearch types for accuracy and completeness.
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
import { AggregationBuilder, AggregationState } from './aggregation.types.js';
import { KnnOptions } from './vector.types.js';
import { SuggesterBuilder, SuggesterState } from './suggester.types.js';

/**
 * Options for match query (excludes 'query' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query.html
 */
export type MatchOptions = Omit<QueryDslMatchQuery, 'query'>;

/**
 * Options for multi_match query (excludes 'query' and 'fields' which are handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-multi-match-query.html
 */
export type MultiMatchOptions = Omit<
  QueryDslMultiMatchQuery,
  'query' | 'fields'
>;

/**
 * Options for fuzzy query (excludes 'value' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html
 */
export type FuzzyOptions = Omit<QueryDslFuzzyQuery, 'value'>;

/**
 * Options for highlighting matched text (base options applied globally)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/highlighting.html
 */
export type HighlightOptions = SearchHighlightBase;

/**
 * Options for regexp query (excludes 'value' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-regexp-query.html
 */
export type RegexpOptions = Omit<QueryDslRegexpQuery, 'value'>;

/**
 * Options for constant_score query (excludes 'filter' which is handled by the builder callback)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-constant-score-query.html
 */
export type ConstantScoreOptions = Omit<QueryDslConstantScoreQuery, 'filter'>;

/**
 * Options for match_phrase_prefix query (excludes 'query' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-phrase-prefix-query.html
 */
export type MatchPhrasePrefixOptions = Omit<
  QueryDslMatchPhrasePrefixQuery,
  'query'
>;

/**
 * Options for geo_distance query.
 * Uses custom type because the official type uses dynamic property patterns for the field name.
 */
export type GeoDistanceOptions = {
  /** Distance from center point */
  distance: string | number;
  /** Distance unit */
  unit?: 'mi' | 'km' | 'mm' | 'cm' | 'm' | 'yd' | 'ft' | 'in' | 'nmi';
  /** Distance calculation method */
  distance_type?: 'arc' | 'plane';
};

/**
 * Options for geo_bounding_box query.
 * Uses custom type because the official type uses dynamic property patterns for the field name.
 */
export type GeoBoundingBoxOptions = {
  /** Top-left corner coordinates */
  top_left?: { lat: number; lon: number };
  /** Bottom-right corner coordinates */
  bottom_right?: { lat: number; lon: number };
  /** Top latitude */
  top?: number;
  /** Left longitude */
  left?: number;
  /** Bottom latitude */
  bottom?: number;
  /** Right longitude */
  right?: number;
};

/**
 * Options for geo_polygon query.
 * Uses custom type because the official type uses dynamic property patterns for the field name.
 */
export type GeoPolygonOptions = {
  /** Polygon vertices */
  points: Array<{ lat: number; lon: number }>;
};

/**
 * Script configuration — re-exported from official @elastic/elasticsearch types
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-scripting.html
 */
export type ScriptOptions = Script;

/**
 * Options for script query — combines script body with query-level options (boost, _name)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-script-query.html
 */
export type ScriptQueryOptions = Script & Omit<QueryDslScriptQuery, 'script'>;

/**
 * Options for script_score query (excludes 'query' and 'script' which are handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-script-score-query.html
 */
export type ScriptScoreOptions = Omit<
  QueryDslScriptScoreQuery,
  'query' | 'script'
>;

/**
 * Options for percolate query — re-exported from official @elastic/elasticsearch types
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-percolate-query.html
 */
export type PercolateOptions = QueryDslPercolateQuery;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Query state representing the complete Elasticsearch query DSL.
 * Input option types are derived from official @elastic/elasticsearch types.
 * Output type alignment (QueryState → SearchSearchRequestBody) is planned for a later step.
 */
export type QueryState<T> = {
  /** Internal: whether to include query wrapper */
  _includeQuery?: boolean;
  /** Query DSL */
  query?: any;
  /** KNN vector search configuration */
  knn?: {
    field: string;
    query_vector: number[];
    k?: number;
    num_candidates?: number;
    filter?: any;
    boost?: number;
    similarity?: number;
  };
  /** Aggregations */
  aggs?: AggregationState;
  /** Suggestions for query terms/phrases/completions */
  suggest?: SuggesterState;
  /** Pagination offset */
  from?: number;
  /** Number of results to return */
  size?: number;
  /** Sort order */
  sort?: Array<{ [K in keyof T]: 'asc' | 'desc' }>;
  /** Fields to include in response */
  _source?: Array<keyof T>;
  /** Query timeout */
  timeout?: string;
  /** Include scores in response */
  track_scores?: boolean;
  /** Include score explanation */
  explain?: boolean;
  /** Minimum score threshold */
  min_score?: number;
  /** Include document version */
  version?: boolean;
  /** Include sequence number and primary term */
  seq_no_primary_term?: boolean;
  /** Track total hits accurately or up to threshold */
  track_total_hits?: boolean | number;
  /** Highlighting configuration */
  highlight?: {
    fields: Record<string, HighlightOptions>;
    pre_tags?: string[];
    post_tags?: string[];
  };
};

/**
 * Clause builder for constructing query clauses within bool contexts
 */
export type ClauseBuilder<T> = {
  /** Match all documents */
  matchAll: () => any;
  /** Full-text match query */
  match: <K extends keyof T>(
    field: K,
    value: T[K],
    options?: MatchOptions
  ) => any;
  /** Multi-field match query */
  multiMatch: <K extends keyof T>(
    fields: K[],
    value: string,
    options?: MultiMatchOptions
  ) => any;
  /** Exact phrase match */
  matchPhrase: <K extends keyof T>(field: K, value: T[K]) => any;
  /** Phrase prefix match for autocomplete */
  matchPhrasePrefix: <K extends keyof T>(
    field: K,
    value: T[K],
    options?: MatchPhrasePrefixOptions
  ) => any;
  /** Exact term match */
  term: <K extends keyof T>(field: K, value: T[K]) => any;
  /** Match any of multiple terms */
  terms: <K extends keyof T>(field: K, value: T[K]) => any;
  /** Range query (gte, lte, gt, lt) */
  range: <K extends keyof T>(
    field: K,
    conditions: { gte?: T[K]; lte?: T[K]; gt?: T[K]; lt?: T[K] }
  ) => any;
  /** Check field exists */
  exists: <K extends keyof T>(field: K) => any;
  /** Prefix match */
  prefix: <K extends keyof T>(field: K, value: string) => any;
  /** Wildcard pattern match */
  wildcard: <K extends keyof T>(field: K, value: string) => any;
  /** Fuzzy match with edit distance */
  fuzzy: <K extends keyof T>(
    field: K,
    value: string,
    options?: FuzzyOptions
  ) => any;
  /** Match documents by IDs */
  ids: (values: string[]) => any;
  /** KNN vector similarity search */
  knn: <K extends keyof T>(
    field: K,
    queryVector: number[],
    options: KnnOptions
  ) => any;
  /** Script-based query */
  script: (options: ScriptQueryOptions) => any;
  /** Conditional query building */
  when: <R>(
    condition: any,
    thenFn: (q: ClauseBuilder<T>) => R,
    elseFn?: (q: ClauseBuilder<T>) => R
  ) => R | undefined;
};

/**
 * Main query builder interface with fluent API
 */
export type QueryBuilder<T> = {
  /** Start a boolean query */
  bool: () => QueryBuilder<T>;
  /** Add must clause (AND, affects scoring) */
  must: (fn: (q: ClauseBuilder<T>) => any) => QueryBuilder<T>;
  /** Add must_not clause (NOT, filter context) */
  mustNot: (fn: (q: ClauseBuilder<T>) => any) => QueryBuilder<T>;
  /** Add should clause (OR, affects scoring) */
  should: (fn: (q: ClauseBuilder<T>) => any) => QueryBuilder<T>;
  /** Add filter clause (AND, no scoring) */
  filter: (fn: (q: ClauseBuilder<T>) => any) => QueryBuilder<T>;
  /** Minimum should clauses that must match */
  minimumShouldMatch: (n: number) => QueryBuilder<T>;

  // Full-text queries
  /** Match all documents */
  matchAll: () => QueryBuilder<T>;
  /** Full-text match query */
  match: <K extends keyof T>(
    field: K,
    value: T[K],
    options?: MatchOptions
  ) => QueryBuilder<T>;
  /** Multi-field match query */
  multiMatch: <K extends keyof T>(
    fields: K[],
    value: string,
    options?: MultiMatchOptions
  ) => QueryBuilder<T>;
  /** Exact phrase match */
  matchPhrase: <K extends keyof T>(field: K, value: T[K]) => QueryBuilder<T>;
  /** Phrase prefix match for autocomplete */
  matchPhrasePrefix: <K extends keyof T>(
    field: K,
    value: T[K],
    options?: MatchPhrasePrefixOptions
  ) => QueryBuilder<T>;

  // Term-level queries
  /** Exact term match */
  term: <K extends keyof T>(field: K, value: T[K]) => QueryBuilder<T>;
  /** Match any of multiple terms */
  terms: <K extends keyof T>(field: K, values: T[K][]) => QueryBuilder<T>;
  /** Range query (gte, lte, gt, lt) */
  range: <K extends keyof T>(
    field: K,
    conditions: { gte?: T[K]; lte?: T[K]; gt?: T[K]; lt?: T[K] }
  ) => QueryBuilder<T>;
  /** Check field exists */
  exists: (field: keyof T) => QueryBuilder<T>;
  /** Prefix match */
  prefix: <K extends keyof T>(field: K, value: string) => QueryBuilder<T>;
  /** Wildcard pattern match */
  wildcard: <K extends keyof T>(field: K, value: string) => QueryBuilder<T>;
  /** Fuzzy match with edit distance */
  fuzzy: <K extends keyof T>(
    field: K,
    value: string,
    options?: FuzzyOptions
  ) => QueryBuilder<T>;
  /** Match documents by IDs */
  ids: (values: string[]) => QueryBuilder<T>;
  /** Nested object query */
  nested: <P extends keyof T>(
    path: P,
    fn: (q: ClauseBuilder<any>) => any,
    options?: { score_mode?: 'avg' | 'sum' | 'min' | 'max' | 'none' }
  ) => QueryBuilder<T>;

  // Vector search
  /** KNN vector similarity search */
  knn: <K extends keyof T>(
    field: K,
    queryVector: number[],
    options: KnnOptions
  ) => QueryBuilder<T>;

  // Script queries
  /** Script-based query */
  script: (options: ScriptQueryOptions) => QueryBuilder<T>;
  /** Custom scoring with script */
  scriptScore: (
    query: (q: ClauseBuilder<T>) => any,
    script: ScriptOptions,
    options?: ScriptScoreOptions
  ) => QueryBuilder<T>;
  /** Percolate query for reverse search */
  percolate: (options: PercolateOptions) => QueryBuilder<T>;

  // Conditionals
  /** Conditional query building */
  when: <R>(
    condition: any,
    thenFn: (q: QueryBuilder<T>) => R,
    elseFn?: (q: QueryBuilder<T>) => R
  ) => R | undefined;

  // Aggregations
  /** Add aggregations */
  aggs: (
    fn: (agg: AggregationBuilder<T>) => AggregationBuilder<T>
  ) => QueryBuilder<T>;

  // Suggestions
  /** Add query suggestions (term, phrase, completion) */
  suggest: (
    fn: (s: SuggesterBuilder<T>) => SuggesterBuilder<T>
  ) => QueryBuilder<T>;

  // Query parameters
  /** Sort results by field */
  sort: <K extends keyof T>(
    field: K,
    direction: 'asc' | 'desc'
  ) => QueryBuilder<T>;
  /** Pagination offset */
  from: (from: number) => QueryBuilder<T>;
  /** Number of results to return */
  size: (size: number) => QueryBuilder<T>;
  /** Fields to include in response */
  _source: (fields: Array<keyof T>) => QueryBuilder<T>;
  /** Query timeout */
  timeout: (timeout: string) => QueryBuilder<T>;
  /** Include scores in response */
  trackScores: (track: boolean) => QueryBuilder<T>;
  /** Include score explanation */
  explain: (explain: boolean) => QueryBuilder<T>;
  /** Minimum score threshold */
  minScore: (score: number) => QueryBuilder<T>;
  /** Include document version */
  version: (version: boolean) => QueryBuilder<T>;
  /** Include sequence number and primary term */
  seqNoPrimaryTerm: (enabled: boolean) => QueryBuilder<T>;
  /** Track total hits accurately or up to threshold */
  trackTotalHits: (value: boolean | number) => QueryBuilder<T>;
  /** Highlight matched text */
  highlight: (
    fields: Array<keyof T>,
    options?: HighlightOptions
  ) => QueryBuilder<T>;

  // Geo queries
  /** Geo distance query */
  geoDistance: <K extends keyof T>(
    field: K,
    center: { lat: number; lon: number },
    options: GeoDistanceOptions
  ) => QueryBuilder<T>;
  /** Geo bounding box query */
  geoBoundingBox: <K extends keyof T>(
    field: K,
    options: GeoBoundingBoxOptions
  ) => QueryBuilder<T>;
  /** Geo polygon query */
  geoPolygon: <K extends keyof T>(
    field: K,
    options: GeoPolygonOptions
  ) => QueryBuilder<T>;

  // Pattern and scoring queries
  /** Regular expression query */
  regexp: <K extends keyof T>(
    field: K,
    value: string,
    options?: RegexpOptions
  ) => QueryBuilder<T>;
  /** Constant score query (no scoring) */
  constantScore: (
    fn: (q: ClauseBuilder<T>) => any,
    options?: ConstantScoreOptions
  ) => QueryBuilder<T>;

  /** Build final query DSL */
  build: () => QueryState<T>;
};
