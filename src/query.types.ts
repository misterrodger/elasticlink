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
  QueryDslCombinedFieldsQuery,
  QueryDslQueryStringQuery,
  QueryDslSimpleQueryStringQuery,
  QueryDslMoreLikeThisQuery,
  QueryDslMatchBoolPrefixQuery,
  QueryDslNestedQuery,
  QueryDslQueryContainer,
  QueryDslDistanceFeatureQuery,
  QueryDslRankFeatureQuery,
  QueryDslSparseVectorQuery,
  QueryDslFunctionScoreQuery,
  QueryDslHasChildQuery,
  QueryDslHasParentQuery,
  QueryDslParentIdQuery,
  QueryDslIntervalsQuery,
  QueryDslSpanNearQuery,
  QueryDslSpanNotQuery,
  QueryDslSpanQuery,
  MappingRuntimeField,
  QueryDslFieldAndFormat,
  ScriptField,
  SearchHighlightBase,
  SearchInnerHits,
  RescoreVector,
  QueryVectorBuilder,
  Script,
  SortResults
} from '@elastic/elasticsearch/lib/api/types';
import type { FieldTypeString } from './index-management.types.js';
import type {
  TextFields,
  KeywordFields,
  NumericFields,
  DateFields,
  BooleanFields,
  GeoPointFields,
  GeoShapeFields,
  DenseVectorFields,
  SparseVectorFields,
  RankFeatureFields,
  IpFields,
  NestedPathFields,
  SubFieldsOf,
  FieldValueType,
  SortableFields,
  CollapsibleFields,
  HighlightableFields
} from './mapping.types.js';
import type { RootAggregationBuilder, AggregationState } from './aggregation.types.js';
import type { KnnOptions } from './vector.types.js';
import type { SuggesterBuilder, SuggesterState } from './suggester.types.js';

export type MatchOptions = Omit<QueryDslMatchQuery, 'query'>;
export type MultiMatchOptions = Omit<QueryDslMultiMatchQuery, 'query' | 'fields'>;
export type FuzzyOptions = Omit<QueryDslFuzzyQuery, 'value'>;
export type HighlightOptions = SearchHighlightBase;
export type RegexpOptions = Omit<QueryDslRegexpQuery, 'value'>;
export type ConstantScoreOptions = Omit<QueryDslConstantScoreQuery, 'filter'>;
export type MatchPhrasePrefixOptions = Omit<QueryDslMatchPhrasePrefixQuery, 'query'>;

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

export type GeoShapeQueryOptions = {
  relation?: 'intersects' | 'disjoint' | 'within' | 'contains';
  boost?: number;
  ignore_unmapped?: boolean;
};

export type ScriptOptions = Script;
export type ScriptQueryOptions = Script & Omit<QueryDslScriptQuery, 'script'>;
export type ScriptScoreOptions = Omit<QueryDslScriptScoreQuery, 'query' | 'script'>;
export type PercolateOptions = QueryDslPercolateQuery;
export type CombinedFieldsOptions = Omit<QueryDslCombinedFieldsQuery, 'query' | 'fields'>;
export type QueryStringOptions = Omit<QueryDslQueryStringQuery, 'query'>;
export type SimpleQueryStringOptions = Omit<QueryDslSimpleQueryStringQuery, 'query'>;
export type MoreLikeThisOptions = Omit<QueryDslMoreLikeThisQuery, 'fields' | 'like'>;
export type MatchBoolPrefixOptions = Omit<QueryDslMatchBoolPrefixQuery, 'query'>;
export type NestedOptions = Omit<QueryDslNestedQuery, 'path' | 'query'>;
export type FunctionScoreOptions = Omit<QueryDslFunctionScoreQuery, 'query'>;
export type HasChildOptions = Omit<QueryDslHasChildQuery, 'query' | 'type'>;
export type HasParentOptions = Omit<QueryDslHasParentQuery, 'query' | 'parent_type'>;
export type ParentIdOptions = Omit<QueryDslParentIdQuery, 'id' | 'type'>;

/**
 * Options for the `intervals` query — the field is supplied as the first argument.
 * The value is the full `QueryDslIntervalsQuery` rule (match, prefix, wildcard, fuzzy, all_of, any_of, etc.).
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-intervals-query.html
 */
export type IntervalsOptions = QueryDslIntervalsQuery;

/**
 * Options for `spanNear` — `clauses` is supplied as the first argument.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-near-query.html
 */
export type SpanNearOptions = Omit<QueryDslSpanNearQuery, 'clauses'>;

/**
 * Options for `spanNot` — `include` and `exclude` are supplied as the first two arguments.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-not-query.html
 */
export type SpanNotOptions = Omit<QueryDslSpanNotQuery, 'include' | 'exclude'>;

/** Re-export the Elastic span query container for composing span clauses. */
export type SpanQuery = QueryDslSpanQuery;

/**
 * Options for the `distance_feature` query — boosts documents by proximity of a
 * `date`, `date_nanos`, or `geo_point` field to a given origin. The builder
 * supplies `field` as an explicit argument and constrains it to date/geo fields.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-distance-feature-query.html
 */
export type DistanceFeatureOptions = Omit<QueryDslDistanceFeatureQuery, 'field'>;

/**
 * Options for the `rank_feature` query — boosts relevance using a numeric feature
 * stored in a `rank_feature` or `rank_features` field. The builder supplies
 * `field` as an explicit argument.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-rank-feature-query.html
 */
export type RankFeatureQueryOptions = Omit<QueryDslRankFeatureQuery, 'field'>;

/**
 * Options for the `sparse_vector` query — scores documents using token-weight
 * vectors produced by a learned sparse model (e.g. ELSER). The builder supplies
 * `field` as an explicit argument.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-sparse-vector-query.html
 */
export type SparseVectorQueryOptions = Omit<QueryDslSparseVectorQuery, 'field'>;

// ---------------------------------------------------------------------------
// Derived field groups
// ---------------------------------------------------------------------------

type TermableFields<M extends Record<string, FieldTypeString>> =
  | KeywordFields<M>
  | NumericFields<M>
  | DateFields<M>
  | BooleanFields<M>
  | IpFields<M>;

type RangeableFields<M extends Record<string, FieldTypeString>> =
  | NumericFields<M>
  | DateFields<M>
  | KeywordFields<M>
  | IpFields<M>;

type FuzzyableFields<M extends Record<string, FieldTypeString>> = TextFields<M> | KeywordFields<M>;

// Infer value type for a field
type Val<M extends Record<string, FieldTypeString>, K extends keyof M> = FieldValueType<M[K]>;

// ---------------------------------------------------------------------------
// QueryState
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
export type QueryState<M extends Record<string, FieldTypeString>> = {
  _includeQuery?: boolean;
  query?: QueryDslQueryContainer;
  knn?: {
    field: string;
    query_vector?: number[];
    query_vector_builder?: QueryVectorBuilder;
    k?: number;
    num_candidates?: number;
    filter?: QueryDslQueryContainer | QueryDslQueryContainer[];
    boost?: number;
    similarity?: number;
    inner_hits?: SearchInnerHits;
    rescore_vector?: RescoreVector;
    visit_percentage?: number;
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
  search_after?: SortResults;
  preference?: string;
  collapse?: {
    field: string;
    inner_hits?: SearchInnerHits;
    max_concurrent_group_searches?: number;
  };
  rescore?: {
    window_size: number;
    query: {
      rescore_query: QueryDslQueryContainer;
      query_weight?: number;
      rescore_query_weight?: number;
      score_mode?: 'total' | 'multiply' | 'avg' | 'max' | 'min';
    };
  };
  stored_fields?: Array<string>;
  terminate_after?: number;
  pit?: { id: string; keep_alive: string };
  indices_boost?: Array<Record<string, number>>;
  runtime_mappings?: Record<string, MappingRuntimeField>;
  docvalue_fields?: Array<QueryDslFieldAndFormat | string>;
  fields?: Array<QueryDslFieldAndFormat | string>;
  post_filter?: QueryDslQueryContainer;
  script_fields?: Record<string, ScriptField>;
  _source_includes?: string[];
  _source_excludes?: string[];
};

// ---------------------------------------------------------------------------
// ClauseBuilder
// ---------------------------------------------------------------------------

export type ClauseBuilder<M extends Record<string, FieldTypeString>> = {
  matchAll: () => any;
  matchNone: () => any;
  match: <K extends TextFields<M> & string>(field: K, value: string, options?: MatchOptions) => any;
  multiMatch: <K extends TextFields<M> & string>(fields: K[], value: string, options?: MultiMatchOptions) => any;
  matchPhrase: <K extends TextFields<M> & string>(field: K, value: string) => any;
  matchPhrasePrefix: <K extends TextFields<M> & string>(
    field: K,
    value: string,
    options?: MatchPhrasePrefixOptions
  ) => any;
  term: <K extends TermableFields<M> & string>(field: K, value: Val<M, K>) => any;
  terms: <K extends TermableFields<M> & string>(field: K, value: Array<Val<M, K>>) => any;
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
  wildcard: <K extends KeywordFields<M> & string>(field: K, value: string) => any;
  fuzzy: <K extends FuzzyableFields<M> & string>(field: K, value: string, options?: FuzzyOptions) => any;
  ids: (values: string[]) => any;
  knn: <K extends DenseVectorFields<M> & string>(field: K, queryVector: number[], options: KnnOptions) => any;
  regexp: <K extends KeywordFields<M> & string>(field: K, value: string, options?: RegexpOptions) => any;
  geoDistance: <K extends GeoPointFields<M> & string>(
    field: K,
    center: { lat: number; lon: number },
    options: GeoDistanceOptions
  ) => any;
  geoBoundingBox: <K extends GeoPointFields<M> & string>(field: K, options: GeoBoundingBoxOptions) => any;
  geoPolygon: <K extends GeoPointFields<M> & string>(field: K, options: GeoPolygonOptions) => any;
  geoShape: <K extends GeoShapeFields<M> & string>(
    field: K,
    shape: Record<string, unknown>,
    options?: GeoShapeQueryOptions
  ) => any;
  /** Distance-feature query — boost relevance by proximity of a date or geo_point field to an origin. */
  distanceFeature: <K extends (DateFields<M> | GeoPointFields<M>) & string>(
    field: K,
    options: DistanceFeatureOptions
  ) => any;
  /** Rank-feature query — boost relevance using a numeric feature in a `rank_feature`/`rank_features` field. */
  rankFeature: <K extends RankFeatureFields<M> & string>(field: K, options?: RankFeatureQueryOptions) => any;
  /** Sparse-vector query — score with token-weight pairs from a learned sparse model (e.g. ELSER). */
  sparseVector: <K extends SparseVectorFields<M> & string>(field: K, options: SparseVectorQueryOptions) => any;
  /**
   * Script query — executes a Painless script to filter documents.
   *
   * **Security:** the `source` string is executed as Painless on the Elasticsearch cluster.
   * Never derive `source` from untrusted user input — use `params` to pass runtime values safely instead.
   */
  script: (options: ScriptQueryOptions) => any;
  combinedFields: <K extends TextFields<M> & string>(
    fields: K[],
    query: string,
    options?: CombinedFieldsOptions
  ) => any;
  /**
   * Query string query — parses a Lucene query syntax string.
   *
   * **Security:** if `query` is derived from untrusted user input, field-level access control and
   * syntax errors may expose internal field names or cause unexpected query behaviour.
   * Prefer `simpleQueryString` for user-facing search boxes — it silently ignores invalid syntax.
   */
  queryString: (query: string, options?: QueryStringOptions) => any;
  /**
   * Simple query string query — a safer Lucene subset for user-facing search.
   *
   * **Security:** invalid syntax is silently ignored rather than returning an error.
   * Still constrain which fields are searched via `options.fields` to avoid exposing sensitive fields.
   */
  simpleQueryString: (query: string, options?: SimpleQueryStringOptions) => any;
  moreLikeThis: (
    fields: Array<(TextFields<M> | KeywordFields<M>) & string>,
    like: string | Array<string | { _index: string; _id: string }>,
    options?: MoreLikeThisOptions
  ) => any;
  matchBoolPrefix: <K extends TextFields<M> & string>(field: K, value: string, options?: MatchBoolPrefixOptions) => any;
  /**
   * Conditionally execute a clause. Returns the clause DSL when `condition` is truthy, `undefined` otherwise.
   * The parent bool method (`must`, `filter`, etc.) treats `undefined` as a no-op — no empty arrays are emitted.
   *
   * `condition` is resolved as follows: functions are called, booleans are used as-is,
   * and any other value is checked for nullishness (`!= null`) — so `0` and `''` are truthy.
   *
   * **Note:** TypeScript cannot narrow closure variables inside callbacks, so values typed as `T | undefined`
   * still require a non-null assertion (`!`) inside the callback even when `condition` guarantees they are defined:
   * ```ts
   * .must(q => q.when(searchTerm, q => q.match('name', searchTerm!)))
   * ```
   */
  /**
   * Nested query inside a clause context — use inside `must`, `filter`, `should`, or `mustNot`.
   *
   * ```ts
   * queryBuilder(m).bool().filter(q => q.nested('variants', qn => qn.term('color', 'red')))
   * ```
   */
  nested: <K extends NestedPathFields<M> & string>(
    path: K,
    fn: (q: ClauseBuilder<SubFieldsOf<M, K>>) => any,
    options?: NestedOptions
  ) => any;
  /** Function score query — wraps an inner query and applies scoring functions (field_value_factor, decay, script_score, etc.). */
  functionScore: (query: (q: ClauseBuilder<M>) => any, options?: FunctionScoreOptions) => any;
  /** Has-child query — returns parent documents whose child documents match the inner query. */
  hasChild: (type: string, query: (q: ClauseBuilder<M>) => any, options?: HasChildOptions) => any;
  /** Has-parent query — returns child documents whose parent document matches the inner query. */
  hasParent: (type: string, query: (q: ClauseBuilder<M>) => any, options?: HasParentOptions) => any;
  /** Parent-ID query — returns child documents joined to a specific parent document. */
  parentId: (type: string, id: string, options?: ParentIdOptions) => any;
  /** Intervals query — returns documents based on the order and proximity of matching terms. */
  intervals: <K extends TextFields<M> & string>(field: K, options: IntervalsOptions) => any;
  /** Span term — matches a single term; the building block for other span queries. */
  spanTerm: <K extends TextFields<M> & string>(field: K, value: string) => any;
  /** Span near — matches spans that are near one another. */
  spanNear: (clauses: ReadonlyArray<SpanQuery>, options?: SpanNearOptions) => any;
  /** Span or — matches the union of its span clauses. */
  spanOr: (clauses: ReadonlyArray<SpanQuery>) => any;
  /** Span not — removes matches that overlap with another span query. */
  spanNot: (include: SpanQuery, exclude: SpanQuery, options?: SpanNotOptions) => any;
  /** Span first — matches spans near the beginning of a field. */
  spanFirst: (match: SpanQuery, end: number) => any;
  /** Span containing — returns matches from `big` that contain a match from `little`. */
  spanContaining: (big: SpanQuery, little: SpanQuery) => any;
  /** Span within — returns matches from `little` that fall within `big`. */
  spanWithin: (big: SpanQuery, little: SpanQuery) => any;
  /** Span multi-term — wraps a multi-term query (wildcard, fuzzy, prefix, range, or regexp) as a span query. */
  spanMultiTerm: (query: Record<string, unknown>) => any;
  /** Span field masking — allows queries on different fields to be combined. */
  spanFieldMasking: (field: string, query: SpanQuery) => any;
  when: (condition: unknown, thenFn: (q: ClauseBuilder<M>) => any) => any | undefined;
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
  matchNone: () => QueryBuilder<M>;
  match: <K extends TextFields<M> & string>(field: K, value: string, options?: MatchOptions) => QueryBuilder<M>;
  multiMatch: <K extends TextFields<M> & string>(
    fields: K[],
    value: string,
    options?: MultiMatchOptions
  ) => QueryBuilder<M>;
  matchPhrase: <K extends TextFields<M> & string>(field: K, value: string) => QueryBuilder<M>;
  matchPhrasePrefix: <K extends TextFields<M> & string>(
    field: K,
    value: string,
    options?: MatchPhrasePrefixOptions
  ) => QueryBuilder<M>;

  term: <K extends TermableFields<M> & string>(field: K, value: Val<M, K>) => QueryBuilder<M>;
  terms: <K extends TermableFields<M> & string>(field: K, values: Array<Val<M, K>>) => QueryBuilder<M>;
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
  prefix: <K extends KeywordFields<M> & string>(field: K, value: string) => QueryBuilder<M>;
  wildcard: <K extends KeywordFields<M> & string>(field: K, value: string) => QueryBuilder<M>;
  fuzzy: <K extends FuzzyableFields<M> & string>(field: K, value: string, options?: FuzzyOptions) => QueryBuilder<M>;
  ids: (values: string[]) => QueryBuilder<M>;
  /**
   * Nested query — for querying fields mapped as `nested()`.
   *
   * Each nested object is stored as a separate hidden document. The `.nested()` wrapper
   * is required for Elasticsearch to search those hidden documents correctly. Without it,
   * queries against nested sub-fields will return no results.
   *
   * The inner callback receives a typed `ClauseBuilder` constrained to the sub-fields of
   * `path`, so field names and value types are checked at compile time.
   *
   * For `object()` fields, no wrapper is needed — query sub-fields directly with dot-notation
   * (e.g. `.term('address.city', 'NYC')`).
   */
  nested: <K extends NestedPathFields<M> & string>(
    path: K,
    fn: (q: ClauseBuilder<SubFieldsOf<M, K>>) => any,
    options?: NestedOptions
  ) => QueryBuilder<M>;

  knn: <K extends DenseVectorFields<M> & string>(
    field: K,
    queryVector: number[],
    options: KnnOptions
  ) => QueryBuilder<M>;

  /**
   * Script query — executes a Painless script to filter documents.
   *
   * **Security:** the `source` string is executed as Painless on the Elasticsearch cluster.
   * Never derive `source` from untrusted user input — use `params` to pass runtime values safely instead.
   */
  script: (options: ScriptQueryOptions) => QueryBuilder<M>;
  /**
   * Script score query — wraps an inner query and rescores results using a Painless script.
   *
   * **Security:** the `source` string is executed as Painless on the Elasticsearch cluster.
   * Never derive `source` from untrusted user input — use `params` to pass runtime values safely instead.
   */
  scriptScore: (
    query: (q: ClauseBuilder<M>) => any,
    script: ScriptOptions,
    options?: ScriptScoreOptions
  ) => QueryBuilder<M>;
  percolate: (options: PercolateOptions) => QueryBuilder<M>;
  /** Function score query — wraps an inner query and applies scoring functions (field_value_factor, decay, script_score, etc.). */
  functionScore: (query: (q: ClauseBuilder<M>) => any, options?: FunctionScoreOptions) => QueryBuilder<M>;
  /** Has-child query — returns parent documents whose child documents match the inner query. */
  hasChild: (type: string, query: (q: ClauseBuilder<M>) => any, options?: HasChildOptions) => QueryBuilder<M>;
  /** Has-parent query — returns child documents whose parent document matches the inner query. */
  hasParent: (type: string, query: (q: ClauseBuilder<M>) => any, options?: HasParentOptions) => QueryBuilder<M>;
  /** Parent-ID query — returns child documents joined to a specific parent document. */
  parentId: (type: string, id: string, options?: ParentIdOptions) => QueryBuilder<M>;
  /** Intervals query — returns documents based on the order and proximity of matching terms. */
  intervals: <K extends TextFields<M> & string>(field: K, options: IntervalsOptions) => QueryBuilder<M>;
  /** Span term — matches a single term; the building block for other span queries. */
  spanTerm: <K extends TextFields<M> & string>(field: K, value: string) => QueryBuilder<M>;
  /** Span near — matches spans that are near one another. */
  spanNear: (clauses: ReadonlyArray<SpanQuery>, options?: SpanNearOptions) => QueryBuilder<M>;
  /** Span or — matches the union of its span clauses. */
  spanOr: (clauses: ReadonlyArray<SpanQuery>) => QueryBuilder<M>;
  /** Span not — removes matches that overlap with another span query. */
  spanNot: (include: SpanQuery, exclude: SpanQuery, options?: SpanNotOptions) => QueryBuilder<M>;
  /** Span first — matches spans near the beginning of a field. */
  spanFirst: (match: SpanQuery, end: number) => QueryBuilder<M>;
  /** Span containing — returns matches from `big` that contain a match from `little`. */
  spanContaining: (big: SpanQuery, little: SpanQuery) => QueryBuilder<M>;
  /** Span within — returns matches from `little` that fall within `big`. */
  spanWithin: (big: SpanQuery, little: SpanQuery) => QueryBuilder<M>;
  /** Span multi-term — wraps a multi-term query (wildcard, fuzzy, prefix, range, or regexp) as a span query. */
  spanMultiTerm: (query: Record<string, unknown>) => QueryBuilder<M>;
  /** Span field masking — allows queries on different fields to be combined. */
  spanFieldMasking: (field: string, query: SpanQuery) => QueryBuilder<M>;

  /**
   * Conditionally apply a branch to the query chain. Returns the result of `thenFn` when `condition` is truthy,
   * otherwise returns the current builder unchanged — the chain is never broken.
   *
   * `condition` is resolved as follows: functions are called, booleans are used as-is,
   * and any other value is checked for nullishness (`!= null`) — so `0` and `''` are truthy.
   *
   * **Note:** TypeScript cannot narrow closure variables inside callbacks, so values typed as `T | undefined`
   * still require a non-null assertion (`!`) inside the callback even when `condition` guarantees they are defined:
   * ```ts
   * queryBuilder(m).bool()
   *   .when(searchTerm, q => q.must(q2 => q2.match('name', searchTerm!)))
   *   .when(minPrice, q => q.filter(q2 => q2.range('price', { gte: minPrice! })))
   *   .build()
   * ```
   */
  when: (condition: unknown, thenFn: (q: QueryBuilder<M>) => QueryBuilder<M>) => QueryBuilder<M>;

  aggs: (fn: (agg: RootAggregationBuilder<M>) => RootAggregationBuilder<M>) => QueryBuilder<M>;

  suggest: (fn: (s: SuggesterBuilder<M>) => SuggesterBuilder<M>) => QueryBuilder<M>;

  sort: (field: (SortableFields<M> & string) | '_score' | '_doc', direction: 'asc' | 'desc') => QueryBuilder<M>;
  from: (from: number) => QueryBuilder<M>;
  size: (size: number) => QueryBuilder<M>;
  _source: (fields: Array<string & keyof M>) => QueryBuilder<M>;
  /** Include-only subset for `_source` filtering (paths may use wildcards). */
  sourceIncludes: (paths: string[]) => QueryBuilder<M>;
  /** Exclude subset for `_source` filtering (paths may use wildcards). */
  sourceExcludes: (paths: string[]) => QueryBuilder<M>;
  /** Runtime mappings — define script-computed fields available to the query, sorts, and aggs. */
  runtimeMappings: (mappings: Record<string, MappingRuntimeField>) => QueryBuilder<M>;
  /** Retrieve doc-values for the specified fields in the hit response. */
  docValueFields: (fields: Array<QueryDslFieldAndFormat | string>) => QueryBuilder<M>;
  /** Retrieve values via the fields API (supports runtime + standard fields with format). */
  fields: (fields: Array<QueryDslFieldAndFormat | string>) => QueryBuilder<M>;
  /** Post-filter — applied after aggregations, so aggs see the unfiltered result set. */
  postFilter: (fn: (q: ClauseBuilder<M>) => any) => QueryBuilder<M>;
  /** Script fields — compute per-hit values via Painless scripts. */
  scriptFields: (fields: Record<string, ScriptField>) => QueryBuilder<M>;
  timeout: (timeout: string) => QueryBuilder<M>;
  trackScores: (track: boolean) => QueryBuilder<M>;
  explain: (explain: boolean) => QueryBuilder<M>;
  minScore: (score: number) => QueryBuilder<M>;
  version: (version: boolean) => QueryBuilder<M>;
  seqNoPrimaryTerm: (enabled: boolean) => QueryBuilder<M>;
  trackTotalHits: (value: boolean | number) => QueryBuilder<M>;
  highlight: (fields: Array<HighlightableFields<M> & string>, options?: HighlightOptions) => QueryBuilder<M>;

  geoDistance: <K extends GeoPointFields<M> & string>(
    field: K,
    center: { lat: number; lon: number },
    options: GeoDistanceOptions
  ) => QueryBuilder<M>;
  geoBoundingBox: <K extends GeoPointFields<M> & string>(field: K, options: GeoBoundingBoxOptions) => QueryBuilder<M>;
  geoPolygon: <K extends GeoPointFields<M> & string>(field: K, options: GeoPolygonOptions) => QueryBuilder<M>;
  geoShape: <K extends GeoShapeFields<M> & string>(
    field: K,
    shape: Record<string, unknown>,
    options?: GeoShapeQueryOptions
  ) => QueryBuilder<M>;

  /** Distance-feature query — boost relevance by proximity of a date or geo_point field to an origin. */
  distanceFeature: <K extends (DateFields<M> | GeoPointFields<M>) & string>(
    field: K,
    options: DistanceFeatureOptions
  ) => QueryBuilder<M>;
  /** Rank-feature query — boost relevance using a numeric feature in a `rank_feature`/`rank_features` field. */
  rankFeature: <K extends RankFeatureFields<M> & string>(
    field: K,
    options?: RankFeatureQueryOptions
  ) => QueryBuilder<M>;
  /** Sparse-vector query — score with token-weight pairs from a learned sparse model (e.g. ELSER). */
  sparseVector: <K extends SparseVectorFields<M> & string>(
    field: K,
    options: SparseVectorQueryOptions
  ) => QueryBuilder<M>;

  regexp: <K extends KeywordFields<M> & string>(field: K, value: string, options?: RegexpOptions) => QueryBuilder<M>;
  constantScore: (fn: (q: ClauseBuilder<M>) => any, options?: ConstantScoreOptions) => QueryBuilder<M>;

  combinedFields: <K extends TextFields<M> & string>(
    fields: K[],
    query: string,
    options?: CombinedFieldsOptions
  ) => QueryBuilder<M>;
  /**
   * Query string query — parses a Lucene query syntax string.
   *
   * **Security:** if `query` is derived from untrusted user input, field-level access control and
   * syntax errors may expose internal field names or cause unexpected query behaviour.
   * Prefer `simpleQueryString` for user-facing search boxes — it silently ignores invalid syntax.
   */
  queryString: (query: string, options?: QueryStringOptions) => QueryBuilder<M>;
  /**
   * Simple query string query — a safer Lucene subset for user-facing search.
   *
   * **Security:** invalid syntax is silently ignored rather than returning an error.
   * Still constrain which fields are searched via `options.fields` to avoid exposing sensitive fields.
   */
  simpleQueryString: (query: string, options?: SimpleQueryStringOptions) => QueryBuilder<M>;
  moreLikeThis: (
    fields: Array<(TextFields<M> | KeywordFields<M>) & string>,
    like: string | Array<string | { _index: string; _id: string }>,
    options?: MoreLikeThisOptions
  ) => QueryBuilder<M>;
  matchBoolPrefix: <K extends TextFields<M> & string>(
    field: K,
    value: string,
    options?: MatchBoolPrefixOptions
  ) => QueryBuilder<M>;

  searchAfter: (values: SortResults) => QueryBuilder<M>;
  preference: (value: string) => QueryBuilder<M>;
  collapse: (
    field: CollapsibleFields<M> & string,
    options?: {
      inner_hits?: SearchInnerHits;
      max_concurrent_group_searches?: number;
    }
  ) => QueryBuilder<M>;
  rescore: (
    queryFn: (q: ClauseBuilder<M>) => any,
    windowSize: number,
    options?: {
      query_weight?: number;
      rescore_query_weight?: number;
      score_mode?: 'total' | 'multiply' | 'avg' | 'max' | 'min';
    }
  ) => QueryBuilder<M>;
  storedFields: (fields: Array<string>) => QueryBuilder<M>;
  terminateAfter: (count: number) => QueryBuilder<M>;
  pit: (id: string, keepAlive: string) => QueryBuilder<M>;
  indicesBoost: (boosts: Array<Record<string, number>>) => QueryBuilder<M>;

  build: () => QueryState<M>;
};
/* eslint-enable @typescript-eslint/no-explicit-any */
