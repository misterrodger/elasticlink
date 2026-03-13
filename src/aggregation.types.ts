/**
 * Type definitions for Aggregations
 * Derived from official @elastic/elasticsearch types for accuracy and completeness.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html
 */

import type {
  AggregationsTermsAggregation,
  AggregationsDateHistogramAggregation,
  AggregationsRangeAggregation,
  AggregationsHistogramAggregation,
  AggregationsAverageAggregation,
  AggregationsSumAggregation,
  AggregationsMinAggregation,
  AggregationsMaxAggregation,
  AggregationsCardinalityAggregation,
  AggregationsPercentilesAggregation,
  AggregationsStatsAggregation,
  AggregationsValueCountAggregation,
  AggregationsCalendarInterval,
  AggregationsExtendedStatsAggregation,
  AggregationsTopHitsAggregation,
  AggregationsAutoDateHistogramAggregation,
  AggregationsCompositeAggregation,
  AggregationsCompositeAggregationSource
} from '@elastic/elasticsearch/lib/api/types';
import type { FieldTypeString } from './index-management.types.js';
import type { DateFields, NumericFields, KeywordFields, BooleanFields, IpFields, NestedPathFields } from './mapping.types.js';

/**
 * Options for terms aggregation (excludes 'field' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html
 */
export type TermsAggOptions = Omit<AggregationsTermsAggregation, 'field'>;

/**
 * Date histogram interval units — re-exported from official @elastic/elasticsearch types
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html
 */
export type DateHistogramInterval = AggregationsCalendarInterval;

/**
 * Options for date_histogram aggregation (excludes 'field' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html
 */
export type DateHistogramAggOptions = Omit<AggregationsDateHistogramAggregation, 'field'>;

/**
 * Options for range aggregation (excludes 'field' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-range-aggregation.html
 */
export type RangeAggOptions = Omit<AggregationsRangeAggregation, 'field'>;

/**
 * Options for histogram aggregation (excludes 'field' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-histogram-aggregation.html
 */
export type HistogramAggOptions = Omit<AggregationsHistogramAggregation, 'field'>;

/**
 * Options for avg aggregation (excludes 'field' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-avg-aggregation.html
 */
export type AvgAggOptions = Omit<AggregationsAverageAggregation, 'field'>;

/**
 * Options for sum aggregation (excludes 'field' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-sum-aggregation.html
 */
export type SumAggOptions = Omit<AggregationsSumAggregation, 'field'>;

/**
 * Options for min aggregation (excludes 'field' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-min-aggregation.html
 */
export type MinAggOptions = Omit<AggregationsMinAggregation, 'field'>;

/**
 * Options for max aggregation (excludes 'field' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-max-aggregation.html
 */
export type MaxAggOptions = Omit<AggregationsMaxAggregation, 'field'>;

/**
 * Options for cardinality aggregation (excludes 'field' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-cardinality-aggregation.html
 */
export type CardinalityAggOptions = Omit<AggregationsCardinalityAggregation, 'field'>;

/**
 * Options for percentiles aggregation (excludes 'field' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-percentile-aggregation.html
 */
export type PercentilesAggOptions = Omit<AggregationsPercentilesAggregation, 'field'>;

/**
 * Options for stats aggregation (excludes 'field' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-stats-aggregation.html
 */
export type StatsAggOptions = Omit<AggregationsStatsAggregation, 'field'>;

/**
 * Options for value_count aggregation (excludes 'field' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-valuecount-aggregation.html
 */
export type ValueCountAggOptions = Omit<AggregationsValueCountAggregation, 'field'>;

/**
 * Options for extended_stats aggregation (excludes 'field' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-extendedstats-aggregation.html
 */
export type ExtendedStatsAggOptions = Omit<AggregationsExtendedStatsAggregation, 'field'>;

/**
 * Options for top_hits aggregation
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-top-hits-aggregation.html
 */
export type TopHitsAggOptions = AggregationsTopHitsAggregation;

/**
 * Options for auto_date_histogram aggregation (excludes 'field' which is handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-autodatehistogram-aggregation.html
 */
export type AutoDateHistogramAggOptions = Omit<AggregationsAutoDateHistogramAggregation, 'field'>;

/**
 * Source entry for composite aggregation — a named single-value source definition
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html
 */
export type CompositeAggSource = Record<string, AggregationsCompositeAggregationSource>;

/**
 * Options for composite aggregation (excludes 'sources' which is handled by the builder)
 */
export type CompositeAggOptions = Omit<AggregationsCompositeAggregation, 'sources'>;

/**
 * Aggregation state for build output
 */
export type AggregationState = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

/**
 * Aggregation builder interface
 */
export type AggregationBuilder<M extends Record<string, FieldTypeString>> = {
  /** Terms aggregation - group by field values */
  terms: <K extends (KeywordFields<M> | NumericFields<M> | BooleanFields<M> | IpFields<M>) & string>(
    name: string,
    field: K,
    options?: TermsAggOptions
  ) => AggregationBuilder<M>;

  /** Date histogram aggregation - group by time intervals */
  dateHistogram: <K extends DateFields<M> & string>(
    name: string,
    field: K,
    options?: DateHistogramAggOptions
  ) => AggregationBuilder<M>;

  /** Range aggregation - group by numeric/date ranges */
  range: <K extends (NumericFields<M> | DateFields<M>) & string>(
    name: string,
    field: K,
    options?: RangeAggOptions
  ) => AggregationBuilder<M>;

  /** Histogram aggregation - group by numeric intervals */
  histogram: <K extends NumericFields<M> & string>(
    name: string,
    field: K,
    options?: HistogramAggOptions
  ) => AggregationBuilder<M>;

  /** Average aggregation */
  avg: <K extends NumericFields<M> & string>(name: string, field: K, options?: AvgAggOptions) => AggregationBuilder<M>;

  /** Sum aggregation */
  sum: <K extends NumericFields<M> & string>(name: string, field: K, options?: SumAggOptions) => AggregationBuilder<M>;

  /** Minimum value aggregation */
  min: <K extends NumericFields<M> & string>(name: string, field: K, options?: MinAggOptions) => AggregationBuilder<M>;

  /** Maximum value aggregation */
  max: <K extends NumericFields<M> & string>(name: string, field: K, options?: MaxAggOptions) => AggregationBuilder<M>;

  /** Cardinality aggregation - count unique values */
  cardinality: <K extends string & keyof M>(
    name: string,
    field: K,
    options?: CardinalityAggOptions
  ) => AggregationBuilder<M>;

  /** Percentiles aggregation */
  percentiles: <K extends NumericFields<M> & string>(
    name: string,
    field: K,
    options?: PercentilesAggOptions
  ) => AggregationBuilder<M>;

  /** Statistics aggregation (count, min, max, avg, sum) */
  stats: <K extends NumericFields<M> & string>(
    name: string,
    field: K,
    options?: StatsAggOptions
  ) => AggregationBuilder<M>;

  /** Value count aggregation */
  valueCount: <K extends string & keyof M>(
    name: string,
    field: K,
    options?: ValueCountAggOptions
  ) => AggregationBuilder<M>;

  /** Extended stats aggregation (count, min, max, avg, sum, std deviation, variance) */
  extendedStats: <K extends NumericFields<M> & string>(
    name: string,
    field: K,
    options?: ExtendedStatsAggOptions
  ) => AggregationBuilder<M>;

  /** Top hits aggregation — returns the most relevant documents per bucket */
  topHits: (name: string, options?: TopHitsAggOptions) => AggregationBuilder<M>;

  /** Auto date histogram aggregation — automatically selects interval to produce the target number of buckets */
  autoDateHistogram: <K extends DateFields<M> & string>(
    name: string,
    field: K,
    options?: AutoDateHistogramAggOptions
  ) => AggregationBuilder<M>;

  /**
   * Composite aggregation — pageable multi-level grouping across multiple value sources.
   * `sources` is an array of `{ [name]: { terms | date_histogram | histogram | geotile_grid: { field, ... } } }` objects.
   */
  composite: (name: string, sources: CompositeAggSource[], options?: CompositeAggOptions) => AggregationBuilder<M>;

  /** Filter aggregation — narrows documents in a bucket by a raw query DSL filter */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: (name: string, query: Record<string, any>) => AggregationBuilder<M>;

  /** Global aggregation — escapes the current filter context to aggregate across all documents */
  global: (name: string) => AggregationBuilder<M>;

  /** Nested aggregation — enters a nested document context for aggregating nested fields */
  nested: <K extends NestedPathFields<M> & string>(name: string, path: K) => AggregationBuilder<M>;

  /** Reverse nested aggregation — returns from a nested context back to the root document */
  reverseNested: (name: string, path?: string) => AggregationBuilder<M>;

  /** Add sub-aggregation to parent bucket aggregation */
  subAgg: (fn: (agg: AggregationBuilder<M>) => AggregationBuilder<M>) => AggregationBuilder<M>;

  /** Build aggregation DSL */
  build: () => AggregationState;
};
