/* eslint-disable @typescript-eslint/no-explicit-any */

// Bucket Aggregation Types
export type TermsAggOptions = {
  size?: number;
  min_doc_count?: number;
  order?: { [key: string]: 'asc' | 'desc' };
  missing?: string;
};

export type DateHistogramInterval =
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';

export type DateHistogramAggOptions = {
  interval: string | DateHistogramInterval;
  min_doc_count?: number;
  order?: { [key: string]: 'asc' | 'desc' };
  extended_bounds?: {
    min?: number | string;
    max?: number | string;
  };
  time_zone?: string;
};

export type RangeAggOptions = {
  ranges: Array<{
    from?: number | string;
    to?: number | string;
    key?: string;
  }>;
};

export type HistogramAggOptions = {
  interval: number;
  min_doc_count?: number;
  order?: { [key: string]: 'asc' | 'desc' };
  extended_bounds?: {
    min?: number;
    max?: number;
  };
};

// Metric Aggregation Types
export type AvgAggOptions = {
  missing?: number;
};

export type SumAggOptions = {
  missing?: number;
};

export type MinAggOptions = {
  missing?: number;
};

export type MaxAggOptions = {
  missing?: number;
};

export type CardinalityAggOptions = {
  precision_threshold?: number;
  missing?: any;
};

export type PercentilesAggOptions = {
  percents?: number[];
  keyed?: boolean;
  missing?: number;
};

export type StatsAggOptions = {
  missing?: number;
};

export type ValueCountAggOptions = {
  missing?: any;
};

// Aggregation Result Types (for build output)
export type AggregationState = {
  [key: string]: any;
};

export type AggregationBuilder<T> = {
  // Bucket aggregations
  terms: <K extends keyof T>(
    name: string,
    field: K,
    options?: TermsAggOptions
  ) => AggregationBuilder<T>;

  dateHistogram: <K extends keyof T>(
    name: string,
    field: K,
    options: DateHistogramAggOptions
  ) => AggregationBuilder<T>;

  range: <K extends keyof T>(
    name: string,
    field: K,
    options: RangeAggOptions
  ) => AggregationBuilder<T>;

  histogram: <K extends keyof T>(
    name: string,
    field: K,
    options: HistogramAggOptions
  ) => AggregationBuilder<T>;

  // Metric aggregations
  avg: <K extends keyof T>(
    name: string,
    field: K,
    options?: AvgAggOptions
  ) => AggregationBuilder<T>;

  sum: <K extends keyof T>(
    name: string,
    field: K,
    options?: SumAggOptions
  ) => AggregationBuilder<T>;

  min: <K extends keyof T>(
    name: string,
    field: K,
    options?: MinAggOptions
  ) => AggregationBuilder<T>;

  max: <K extends keyof T>(
    name: string,
    field: K,
    options?: MaxAggOptions
  ) => AggregationBuilder<T>;

  cardinality: <K extends keyof T>(
    name: string,
    field: K,
    options?: CardinalityAggOptions
  ) => AggregationBuilder<T>;

  percentiles: <K extends keyof T>(
    name: string,
    field: K,
    options?: PercentilesAggOptions
  ) => AggregationBuilder<T>;

  stats: <K extends keyof T>(
    name: string,
    field: K,
    options?: StatsAggOptions
  ) => AggregationBuilder<T>;

  valueCount: <K extends keyof T>(
    name: string,
    field: K,
    options?: ValueCountAggOptions
  ) => AggregationBuilder<T>;

  // Sub-aggregations
  subAgg: (
    fn: (agg: AggregationBuilder<T>) => AggregationBuilder<T>
  ) => AggregationBuilder<T>;

  // Build
  build: () => AggregationState;
};

// Geo Query Types
export type GeoDistance = {
  distance: string | number;
  unit?: 'mi' | 'km' | 'mm' | 'cm' | 'm' | 'yd' | 'ft' | 'in' | 'nmi';
};

export type GeoBoundingBox = {
  top_left?: { lat: number; lon: number };
  bottom_right?: { lat: number; lon: number };
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
};

export type GeoPolygon = {
  points: Array<{ lat: number; lon: number }>;
};

// Additional Query Options
export type RegexpOptions = {
  flags?: string;
  max_determinized_states?: number;
  boost?: number;
};

export type ConstantScoreOptions = {
  boost?: number;
};
