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

export const createAggregationBuilder = <
  M extends Record<string, FieldTypeString>
>(
  state: AggregationState = {}
): AggregationBuilder<M> => ({
  // Bucket aggregations
  terms: <K extends string & keyof M>(
    name: string,
    field: K,
    options?: TermsAggOptions
  ) => {
    const aggregations: AggregationState = { ...state };
    aggregations[name] = {
      terms: {
        field: String(field),
        ...(options && Object.keys(options).length > 0 ? options : {})
      }
    };
    return createAggregationBuilder<M>(aggregations);
  },

  dateHistogram: <K extends string & keyof M>(
    name: string,
    field: K,
    options: DateHistogramAggOptions
  ) => {
    const aggregations: AggregationState = { ...state };
    aggregations[name] = {
      date_histogram: {
        field: String(field),
        ...options
      }
    };
    return createAggregationBuilder<M>(aggregations);
  },

  range: <K extends string & keyof M>(
    name: string,
    field: K,
    options: RangeAggOptions
  ) => {
    const aggregations: AggregationState = { ...state };
    aggregations[name] = {
      range: {
        field: String(field),
        ranges: options.ranges
      }
    };
    return createAggregationBuilder<M>(aggregations);
  },

  histogram: <K extends string & keyof M>(
    name: string,
    field: K,
    options: HistogramAggOptions
  ) => {
    const aggregations: AggregationState = { ...state };
    aggregations[name] = {
      histogram: {
        field: String(field),
        ...options
      }
    };
    return createAggregationBuilder<M>(aggregations);
  },

  // Metric aggregations
  avg: <K extends string & keyof M>(
    name: string,
    field: K,
    options?: AvgAggOptions
  ) => {
    const aggregations: AggregationState = { ...state };
    aggregations[name] = {
      avg: {
        field: String(field),
        ...(options && Object.keys(options).length > 0 ? options : {})
      }
    };
    return createAggregationBuilder<M>(aggregations);
  },

  sum: <K extends string & keyof M>(
    name: string,
    field: K,
    options?: SumAggOptions
  ) => {
    const aggregations: AggregationState = { ...state };
    aggregations[name] = {
      sum: {
        field: String(field),
        ...(options && Object.keys(options).length > 0 ? options : {})
      }
    };
    return createAggregationBuilder<M>(aggregations);
  },

  min: <K extends string & keyof M>(
    name: string,
    field: K,
    options?: MinAggOptions
  ) => {
    const aggregations: AggregationState = { ...state };
    aggregations[name] = {
      min: {
        field: String(field),
        ...(options && Object.keys(options).length > 0 ? options : {})
      }
    };
    return createAggregationBuilder<M>(aggregations);
  },

  max: <K extends string & keyof M>(
    name: string,
    field: K,
    options?: MaxAggOptions
  ) => {
    const aggregations: AggregationState = { ...state };
    aggregations[name] = {
      max: {
        field: String(field),
        ...(options && Object.keys(options).length > 0 ? options : {})
      }
    };
    return createAggregationBuilder<M>(aggregations);
  },

  cardinality: <K extends string & keyof M>(
    name: string,
    field: K,
    options?: CardinalityAggOptions
  ) => {
    const aggregations: AggregationState = { ...state };
    aggregations[name] = {
      cardinality: {
        field: String(field),
        ...(options && Object.keys(options).length > 0 ? options : {})
      }
    };
    return createAggregationBuilder<M>(aggregations);
  },

  percentiles: <K extends string & keyof M>(
    name: string,
    field: K,
    options?: PercentilesAggOptions
  ) => {
    const aggregations: AggregationState = { ...state };
    aggregations[name] = {
      percentiles: {
        field: String(field),
        ...(options && Object.keys(options).length > 0 ? options : {})
      }
    };
    return createAggregationBuilder<M>(aggregations);
  },

  stats: <K extends string & keyof M>(
    name: string,
    field: K,
    options?: StatsAggOptions
  ) => {
    const aggregations: AggregationState = { ...state };
    aggregations[name] = {
      stats: {
        field: String(field),
        ...(options && Object.keys(options).length > 0 ? options : {})
      }
    };
    return createAggregationBuilder<M>(aggregations);
  },

  valueCount: <K extends string & keyof M>(
    name: string,
    field: K,
    options?: ValueCountAggOptions
  ) => {
    const aggregations: AggregationState = { ...state };
    aggregations[name] = {
      value_count: {
        field: String(field),
        ...(options && Object.keys(options).length > 0 ? options : {})
      }
    };
    return createAggregationBuilder<M>(aggregations);
  },

  // Sub-aggregations
  subAgg: (fn) => {
    // Get the last aggregation added
    const keys = Object.keys(state);
    if (keys.length === 0) {
      throw new Error('No aggregation to add sub-aggregation to');
    }

    const lastKey = keys[keys.length - 1];
    const lastAgg = state[lastKey];

    // Apply sub-aggregations
    const subAggs = fn(createAggregationBuilder<M>({})).build();
    const updatedState = {
      ...state,
      [lastKey]: {
        ...lastAgg,
        aggs: subAggs
      }
    };

    return createAggregationBuilder<M>(updatedState);
  },

  // Build
  build: () => state
});

// Helper function to create aggregations without needing to import the builder
export const aggregations = <M extends Record<string, FieldTypeString>>(
  _schema: MappingsSchema<M>
) => createAggregationBuilder<M>();
