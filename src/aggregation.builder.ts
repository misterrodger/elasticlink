import type { FieldTypeString } from './index-management.types.js';
import type { MappingsSchema } from './mapping.types.js';
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
  ValueCountAggOptions
} from './aggregation.types.js';

export const createAggregationBuilder = <M extends Record<string, FieldTypeString>>(
  state: AggregationState = {}
): AggregationBuilder<M> => ({
  // Bucket aggregations
  terms: <K extends string & keyof M>(name: string, field: K, options?: TermsAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: {
        terms: {
          field,
          ...(options && options)
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
          ...(options && options)
        }
      }
    });
  },

  range: <K extends string & keyof M>(name: string, field: K, options?: RangeAggOptions) => {
    return createAggregationBuilder<M>({
      ...state,
      [name]: {
        range: {
          field,
          ...(options && options)
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
          ...(options && options)
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
          ...(options && options)
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
          ...(options && options)
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
          ...(options && options)
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
          ...(options && options)
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
          ...(options && options)
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
          ...(options && options)
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
          ...(options && options)
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
          ...(options && options)
        }
      }
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
