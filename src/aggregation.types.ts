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
  AggregationsCompositeAggregationSource,
  AggregationsDateRangeAggregation,
  AggregationsFiltersAggregation,
  AggregationsSignificantTermsAggregation,
  AggregationsRareTermsAggregation,
  AggregationsMultiTermsAggregation,
  AggregationsGeoDistanceAggregation,
  AggregationsGeoHashGridAggregation,
  AggregationsGeoTileGridAggregation,
  AggregationsGeoBoundsAggregation,
  AggregationsGeoCentroidAggregation,
  AggregationsMissingAggregation,
  AggregationsTopMetricsAggregation,
  AggregationsWeightedAverageAggregation,
  AggregationsBucketScriptAggregation,
  AggregationsBucketSelectorAggregation,
  AggregationsDerivativeAggregation,
  AggregationsCumulativeSumAggregation,
  QueryDslQueryContainer
} from '@elastic/elasticsearch/lib/api/types';
import type { FieldTypeString } from './index-management.types.js';
import type {
  DateFields,
  NumericFields,
  KeywordFields,
  BooleanFields,
  IpFields,
  TextFields,
  GeoPointFields,
  NestedPathFields,
  SubFieldsOf
} from './mapping.types.js';

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
 * Options for date_range aggregation (excludes 'field' which is handled by the builder).
 * Complement to `range` for date-typed fields; supports date-math expressions in `ranges[].from`/`to`.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-daterange-aggregation.html
 */
export type DateRangeAggOptions = Omit<AggregationsDateRangeAggregation, 'field'>;

/**
 * Options for filters aggregation — multi-filter buckets. Distinct from the single-query
 * `.filter(name, query)` metric-wrapping aggregation. `filters` creates one named bucket per
 * supplied query, plus an optional `other_bucket` for non-matches.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-filters-aggregation.html
 */
export type FiltersAggOptions = Omit<AggregationsFiltersAggregation, 'filters'>;

/**
 * Options for significant_terms aggregation (excludes 'field' which is handled by the builder).
 * Text-analytics staple — returns terms that are statistically significant in the foreground
 * set relative to the background set.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-significantterms-aggregation.html
 */
export type SignificantTermsAggOptions = Omit<AggregationsSignificantTermsAggregation, 'field'>;

/** Options for rare_terms aggregation (excludes 'field' which is handled by the builder) */
export type RareTermsAggOptions = Omit<AggregationsRareTermsAggregation, 'field'>;

/** Options for multi_terms aggregation — full passthrough (field is inside `terms` array) */
export type MultiTermsAggOptions = AggregationsMultiTermsAggregation;

/** Options for geo_distance aggregation (excludes 'field' which is handled by the builder) */
export type GeoDistanceAggOptions = Omit<AggregationsGeoDistanceAggregation, 'field'>;

/** Options for geohash_grid aggregation (excludes 'field' which is handled by the builder) */
export type GeohashGridAggOptions = Omit<AggregationsGeoHashGridAggregation, 'field'>;

/** Options for geotile_grid aggregation (excludes 'field' which is handled by the builder) */
export type GeotileGridAggOptions = Omit<AggregationsGeoTileGridAggregation, 'field'>;

/** Options for geo_bounds aggregation (excludes 'field' which is handled by the builder) */
export type GeoBoundsAggOptions = Omit<AggregationsGeoBoundsAggregation, 'field'>;

/** Options for geo_centroid aggregation (excludes 'field' which is handled by the builder) */
export type GeoCentroidAggOptions = Omit<AggregationsGeoCentroidAggregation, 'field'>;

/** Options for missing aggregation (excludes 'field' which is handled by the builder) */
export type MissingAggOptions = Omit<AggregationsMissingAggregation, 'field'>;

/** Options for top_metrics aggregation — full passthrough (metrics and sort in options) */
export type TopMetricsAggOptions = AggregationsTopMetricsAggregation;

/** Options for weighted_avg aggregation — full passthrough (value and weight in options) */
export type WeightedAvgAggOptions = AggregationsWeightedAverageAggregation;

/** Options for bucket_script pipeline aggregation — full passthrough */
export type BucketScriptAggOptions = AggregationsBucketScriptAggregation;

/** Options for bucket_selector pipeline aggregation — full passthrough */
export type BucketSelectorAggOptions = AggregationsBucketSelectorAggregation;

/** Options for derivative pipeline aggregation — full passthrough */
export type DerivativeAggOptions = AggregationsDerivativeAggregation;

/** Options for cumulative_sum pipeline aggregation — full passthrough */
export type CumulativeSumAggOptions = AggregationsCumulativeSumAggregation;

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
 * Shared metric and bucket aggregation methods.
 * `Self` is the return type for each method — varies by context (root vs nested).
 */
export type BaseAggMethods<M extends Record<string, FieldTypeString>, Self> = {
  terms: <K extends (KeywordFields<M> | NumericFields<M> | BooleanFields<M> | IpFields<M>) & string>(
    name: string,
    field: K,
    options?: TermsAggOptions
  ) => Self;

  dateHistogram: <K extends DateFields<M> & string>(name: string, field: K, options?: DateHistogramAggOptions) => Self;

  range: <K extends (NumericFields<M> | DateFields<M>) & string>(
    name: string,
    field: K,
    options?: RangeAggOptions
  ) => Self;

  /** Date-range aggregation — complement to `range` for date-typed fields. Supports date-math in range bounds. */
  dateRange: <K extends DateFields<M> & string>(name: string, field: K, options?: DateRangeAggOptions) => Self;

  /**
   * Multi-filter aggregation — creates one named bucket per supplied query, plus an optional
   * `other_bucket` for non-matches. Distinct from the single-query `.filter(name, query)`.
   */
  filters: (name: string, filters: Record<string, QueryDslQueryContainer>, options?: FiltersAggOptions) => Self;

  /** Significant-terms aggregation — statistically significant terms relative to the background set. */
  significantTerms: <K extends (KeywordFields<M> | TextFields<M>) & string>(
    name: string,
    field: K,
    options?: SignificantTermsAggOptions
  ) => Self;

  histogram: <K extends NumericFields<M> & string>(name: string, field: K, options?: HistogramAggOptions) => Self;

  avg: <K extends NumericFields<M> & string>(name: string, field: K, options?: AvgAggOptions) => Self;
  sum: <K extends NumericFields<M> & string>(name: string, field: K, options?: SumAggOptions) => Self;
  min: <K extends NumericFields<M> & string>(name: string, field: K, options?: MinAggOptions) => Self;
  max: <K extends NumericFields<M> & string>(name: string, field: K, options?: MaxAggOptions) => Self;

  cardinality: <
    K extends (KeywordFields<M> | TextFields<M> | NumericFields<M> | DateFields<M> | BooleanFields<M> | IpFields<M>) &
      string
  >(
    name: string,
    field: K,
    options?: CardinalityAggOptions
  ) => Self;

  percentiles: <K extends NumericFields<M> & string>(name: string, field: K, options?: PercentilesAggOptions) => Self;

  stats: <K extends NumericFields<M> & string>(name: string, field: K, options?: StatsAggOptions) => Self;

  valueCount: <
    K extends (KeywordFields<M> | TextFields<M> | NumericFields<M> | DateFields<M> | BooleanFields<M> | IpFields<M>) &
      string
  >(
    name: string,
    field: K,
    options?: ValueCountAggOptions
  ) => Self;

  extendedStats: <K extends NumericFields<M> & string>(
    name: string,
    field: K,
    options?: ExtendedStatsAggOptions
  ) => Self;

  topHits: (name: string, options?: TopHitsAggOptions) => Self;

  autoDateHistogram: <K extends DateFields<M> & string>(
    name: string,
    field: K,
    options?: AutoDateHistogramAggOptions
  ) => Self;

  composite: (name: string, sources: CompositeAggSource[], options?: CompositeAggOptions) => Self;

  filter: (name: string, query: QueryDslQueryContainer) => Self;

  /** Rare-terms aggregation — returns terms that are rare in the index (inverse of terms). */
  rareTerms: <K extends (KeywordFields<M> | NumericFields<M> | IpFields<M>) & string>(
    name: string,
    field: K,
    options?: RareTermsAggOptions
  ) => Self;

  /** Multi-terms aggregation — creates buckets from combinations of multiple field values. */
  multiTerms: (name: string, options: MultiTermsAggOptions) => Self;

  /** Geo-distance aggregation — buckets documents by distance from an origin point. */
  geoDistance: <K extends GeoPointFields<M> & string>(name: string, field: K, options: GeoDistanceAggOptions) => Self;

  /** Geohash-grid aggregation — groups geo_point values into grid cells. */
  geohashGrid: <K extends GeoPointFields<M> & string>(name: string, field: K, options?: GeohashGridAggOptions) => Self;

  /** Geotile-grid aggregation — groups geo_point values into map tile cells. */
  geotileGrid: <K extends GeoPointFields<M> & string>(name: string, field: K, options?: GeotileGridAggOptions) => Self;

  /** Geo-bounds aggregation — computes the bounding box containing all geo_point values. */
  geoBounds: <K extends GeoPointFields<M> & string>(name: string, field: K, options?: GeoBoundsAggOptions) => Self;

  /** Geo-centroid aggregation — computes the weighted centroid of all geo_point values. */
  geoCentroid: <K extends GeoPointFields<M> & string>(name: string, field: K, options?: GeoCentroidAggOptions) => Self;

  /** Missing aggregation — counts documents with missing or null values for a field. */
  missing: <
    K extends (KeywordFields<M> | TextFields<M> | NumericFields<M> | DateFields<M> | BooleanFields<M> | IpFields<M>) &
      string
  >(
    name: string,
    field: K,
    options?: MissingAggOptions
  ) => Self;

  /** Top-metrics aggregation — returns the top document's metrics sorted by a given criterion. */
  topMetrics: (name: string, options: TopMetricsAggOptions) => Self;

  /** Weighted-average aggregation — computes a weighted average of numeric values. */
  weightedAvg: (name: string, options: WeightedAvgAggOptions) => Self;

  /** Bucket-script pipeline aggregation — executes a script on bucket values from other aggs. */
  bucketScript: (name: string, options: BucketScriptAggOptions) => Self;

  /** Bucket-selector pipeline aggregation — filters buckets based on a script predicate. */
  bucketSelector: (name: string, options: BucketSelectorAggOptions) => Self;

  /** Derivative pipeline aggregation — calculates the derivative of a metric in a parent histogram/date_histogram. */
  derivative: (name: string, options: DerivativeAggOptions) => Self;

  /** Cumulative-sum pipeline aggregation — calculates the cumulative sum of a metric in a parent histogram/date_histogram. */
  cumulativeSum: (name: string, options: CumulativeSumAggOptions) => Self;

  build: () => AggregationState;
};

/**
 * Root-level aggregation builder. Supports `global` and `nested`; does not expose `reverseNested`.
 *
 * Declared as an `interface` (not a `type` alias) so that TypeScript's lazy interface resolution
 * handles the 3-way mutual recursion between `RootAggregationBuilder`, `NestedEntryBuilder`,
 * and `NestedAggregationBuilder` without triggering TS2456 (circular type alias).
 */
export interface RootAggregationBuilder<M extends Record<string, FieldTypeString>> extends BaseAggMethods<
  M,
  RootAggregationBuilder<M>
> {
  /** Global aggregation — escapes the current filter context to aggregate across all documents.
   * @remarks Only valid at the root aggregation level, not inside a nested context. */
  global: (name: string) => RootAggregationBuilder<M>;

  /** Nested aggregation — enters a nested document context for aggregating nested fields.
   * Returns a `NestedEntryBuilder` whose `subAgg` callback receives the nested sub-field types. */
  nested: <K extends NestedPathFields<M> & string>(
    name: string,
    path: K
  ) => NestedEntryBuilder<M, SubFieldsOf<M, K>, RootAggregationBuilder<M>, M>;

  /** Add sub-aggregation to the last bucket aggregation */
  subAgg: (fn: (agg: RootAggregationBuilder<M>) => RootAggregationBuilder<M>) => RootAggregationBuilder<M>;
}

/**
 * Returned by `.nested()` on a root or nested builder.
 *
 * Dual-context design: metric/bucket helpers inherited from `BaseAggMethods<M, R>` operate
 * on the parent field map `M` (sibling aggregations), while the `subAgg` callback is typed
 * to `NestedAggregationBuilder<N>`, giving it access only to the nested sub-fields `N`.
 *
 * `R` is the parent context — `RootAggregationBuilder<M>` when called from root,
 * `NestedAggregationBuilder<M>` when called from inside a nested context.
 */
export interface NestedEntryBuilder<
  M extends Record<string, FieldTypeString>,
  N extends Record<string, FieldTypeString>,
  R = RootAggregationBuilder<M>,
  Root extends Record<string, FieldTypeString> = M
> extends BaseAggMethods<M, R> {
  global: (name: string) => RootAggregationBuilder<M>;

  nested: <K extends NestedPathFields<M> & string>(
    name: string,
    path: K
  ) => NestedEntryBuilder<M, SubFieldsOf<M, K>, R, Root>;

  subAgg: (fn: (agg: NestedAggregationBuilder<N, Root>) => NestedAggregationBuilder<N, Root>) => R;
}

/**
 * Nested-context aggregation builder. Supports `reverseNested` and nested-level `nested`;
 * does not expose `global`.
 */
export interface NestedAggregationBuilder<
  N extends Record<string, FieldTypeString>,
  Root extends Record<string, FieldTypeString> = N
> extends BaseAggMethods<N, NestedAggregationBuilder<N, Root>> {
  /** Nested aggregation within a nested context — supports multi-level nesting */
  nested: <K extends NestedPathFields<N> & string>(
    name: string,
    path: K
  ) => NestedEntryBuilder<N, SubFieldsOf<N, K>, NestedAggregationBuilder<N, Root>, Root>;

  /** Reverse nested aggregation — returns from a nested context back to the root document.
   * @remarks Only valid inside a nested aggregation context. */
  reverseNested: (name: string, path?: string) => NestedAggregationBuilder<Root, Root>;

  /** Add sub-aggregation to the last bucket aggregation */
  subAgg: (
    fn: (agg: NestedAggregationBuilder<N, Root>) => NestedAggregationBuilder<N, Root>
  ) => NestedAggregationBuilder<N, Root>;
}
