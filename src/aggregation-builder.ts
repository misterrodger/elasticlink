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
} from './aggregation-types';

export const createAggregationBuilder = <T>(
  state: AggregationState = {}
): AggregationBuilder<T> => ({
  // Bucket aggregations
  terms: <K extends keyof T>(
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
    return createAggregationBuilder<T>(aggregations);
  },

  dateHistogram: <K extends keyof T>(
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
    return createAggregationBuilder<T>(aggregations);
  },

  range: <K extends keyof T>(
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
    return createAggregationBuilder<T>(aggregations);
  },

  histogram: <K extends keyof T>(
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
    return createAggregationBuilder<T>(aggregations);
  },

  // Metric aggregations
  avg: <K extends keyof T>(name: string, field: K, options?: AvgAggOptions) => {
    const aggregations: AggregationState = { ...state };
    aggregations[name] = {
      avg: {
        field: String(field),
        ...(options && Object.keys(options).length > 0 ? options : {})
      }
    };
    return createAggregationBuilder<T>(aggregations);
  },

  sum: <K extends keyof T>(name: string, field: K, options?: SumAggOptions) => {
    const aggregations: AggregationState = { ...state };
    aggregations[name] = {
      sum: {
        field: String(field),
        ...(options && Object.keys(options).length > 0 ? options : {})
      }
    };
    return createAggregationBuilder<T>(aggregations);
  },

  min: <K extends keyof T>(name: string, field: K, options?: MinAggOptions) => {
    const aggregations: AggregationState = { ...state };
    aggregations[name] = {
      min: {
        field: String(field),
        ...(options && Object.keys(options).length > 0 ? options : {})
      }
    };
    return createAggregationBuilder<T>(aggregations);
  },

  max: <K extends keyof T>(name: string, field: K, options?: MaxAggOptions) => {
    const aggregations: AggregationState = { ...state };
    aggregations[name] = {
      max: {
        field: String(field),
        ...(options && Object.keys(options).length > 0 ? options : {})
      }
    };
    return createAggregationBuilder<T>(aggregations);
  },

  cardinality: <K extends keyof T>(
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
    return createAggregationBuilder<T>(aggregations);
  },

  percentiles: <K extends keyof T>(
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
    return createAggregationBuilder<T>(aggregations);
  },

  stats: <K extends keyof T>(
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
    return createAggregationBuilder<T>(aggregations);
  },

  valueCount: <K extends keyof T>(
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
    return createAggregationBuilder<T>(aggregations);
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
    const subAggs = fn(createAggregationBuilder<T>({})).build();
    const updatedState = {
      ...state,
      [lastKey]: {
        ...lastAgg,
        aggs: subAggs
      }
    };

    return createAggregationBuilder<T>(updatedState);
  },

  // Build
  build: () => state
});

// Helper function to create aggregations without needing to import the builder
export const aggregations = <T>() => createAggregationBuilder<T>();
