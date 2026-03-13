import type { FieldTypeString } from './index-management.types.js';
import type { MappingsSchema, KeywordFields, NumericFields, BooleanFields, IpFields, DateFields, NestedPathFields } from './mapping.types.js';
import {
  AggregationBuilder,
  AggregationState,
  TermsAggOptions,
  DateHistogramAggOptions,
  RangeAggOptions,
  HistogramAggOptions,
  AvgAggOptions,
  SumAggOptions,
  MinAggOptions,
  MaxAggOptions,
  CardinalityAggOptions,
  PercentilesAggOptions,
  StatsAggOptions,
  ValueCountAggOptions,
  ExtendedStatsAggOptions,
  TopHitsAggOptions,
  AutoDateHistogramAggOptions,
  CompositeAggSource,
  CompositeAggOptions
} from './aggregation.types.js';

export const createAggregationBuilder = <M extends Record<string, FieldTypeString>>(
  state: AggregationState = {}
): AggregationBuilder<M> => ({
  // Bucket aggregations
  terms: <K extends (KeywordFields<M> | NumericFields<M> | BooleanFields<M> | IpFields<M>) & string>(name: string, field: K, options?: TermsAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: {
        terms: {
          field,
          ...(options ?? {})
        }
      }
    });
  },

  dateHistogram: <K extends string & keyof M>(name: string, field: K, options?: DateHistogramAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: {
        date_histogram: {
          field,
          ...(options ?? {})
        }
      }
    });
  },

  range: <K extends (NumericFields<M> | DateFields<M>) & string>(name: string, field: K, options?: RangeAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: {
        range: {
          field,
          ...(options ?? {})
        }
      }
    });
  },

  histogram: <K extends string & keyof M>(name: string, field: K, options?: HistogramAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: {
        histogram: {
          field,
          ...(options ?? {})
        }
      }
    });
  },

  // Metric aggregations
  avg: <K extends string & keyof M>(name: string, field: K, options?: AvgAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: {
        avg: {
          field,
          ...(options ?? {})
        }
      }
    });
  },

  sum: <K extends string & keyof M>(name: string, field: K, options?: SumAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: {
        sum: {
          field,
          ...(options ?? {})
        }
      }
    });
  },

  min: <K extends string & keyof M>(name: string, field: K, options?: MinAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: {
        min: {
          field,
          ...(options ?? {})
        }
      }
    });
  },

  max: <K extends string & keyof M>(name: string, field: K, options?: MaxAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: {
        max: {
          field,
          ...(options ?? {})
        }
      }
    });
  },

  cardinality: <K extends string & keyof M>(name: string, field: K, options?: CardinalityAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: {
        cardinality: {
          field,
          ...(options ?? {})
        }
      }
    });
  },

  percentiles: <K extends string & keyof M>(name: string, field: K, options?: PercentilesAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: {
        percentiles: {
          field,
          ...(options ?? {})
        }
      }
    });
  },

  stats: <K extends string & keyof M>(name: string, field: K, options?: StatsAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: {
        stats: {
          field,
          ...(options ?? {})
        }
      }
    });
  },

  valueCount: <K extends string & keyof M>(name: string, field: K, options?: ValueCountAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: {
        value_count: {
          field,
          ...(options ?? {})
        }
      }
    });
  },

  extendedStats: <K extends string & keyof M>(name: string, field: K, options?: ExtendedStatsAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: { extended_stats: { field, ...(options ?? {}) } }
    });
  },

  topHits: (name: string, options?: TopHitsAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: { top_hits: { ...(options ?? {}) } }
    });
  },

  autoDateHistogram: <K extends string & keyof M>(name: string, field: K, options?: AutoDateHistogramAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: { auto_date_histogram: { field, ...(options ?? {}) } }
    });
  },

  composite: (name: string, sources: CompositeAggSource[], options?: CompositeAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: { composite: { sources, ...(options ?? {}) } }
    });
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: (name: string, query: Record<string, any>) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: { filter: query }
    });
  },

  global: (name: string) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: { global: {} }
    });
  },

  nested: <K extends string & keyof M>(name: string, path: K) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: { nested: { path } }
    });
  },

  reverseNested: (name: string, path?: string) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: { reverse_nested: path ? { path } : {} }
    });
  },

  // Sub-aggregations
  subAgg: (fn) => {
    const keys = Object.keys(state);
    const lastKey = keys.at(-1)!;
    const { [lastKey]: lastAgg } = state;
    const subAggs = fn(createAggregationBuilder<M>({})).build();

    return createAggregationBuilder<M>({
      ...state,
      [lastKey]: {
        ...lastAgg,
        aggs: subAggs
      }
    });
  },

  // Build
  // eslint-disable-next-line functional/functional-parameters
  build: () => state
});

// Helper function to create aggregations without needing to import the builder
export const aggregations = <M extends Record<string, FieldTypeString>>(_schema: MappingsSchema<M>) =>
  createAggregationBuilder<M>();
