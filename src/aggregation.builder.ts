import type { FieldTypeString } from './index-management.types.js';
import type { MappingsSchema, NestedPathFields, SubFieldsOf } from './mapping.types.js';
import type {
  RootAggregationBuilder,
  NestedEntryBuilder,
  NestedAggregationBuilder,
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

// Shared metric/bucket method implementations — return type is `any` so the same code
// can be spread into RootAggregationBuilder, NestedEntryBuilder, and NestedAggregationBuilder.
// The actual return-type contracts are enforced by the public factory return-type annotations.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sharedAggMethods = (state: AggregationState, rebuild: (s: AggregationState) => any) => ({
  terms: (name: string, field: string, options?: TermsAggOptions) =>
    rebuild({ ...state, [name]: { terms: { field, ...(options ?? {}) } } }),

  dateHistogram: (name: string, field: string, options?: DateHistogramAggOptions) =>
    rebuild({ ...state, [name]: { date_histogram: { field, ...(options ?? {}) } } }),

  range: (name: string, field: string, options?: RangeAggOptions) =>
    rebuild({ ...state, [name]: { range: { field, ...(options ?? {}) } } }),

  histogram: (name: string, field: string, options?: HistogramAggOptions) =>
    rebuild({ ...state, [name]: { histogram: { field, ...(options ?? {}) } } }),

  avg: (name: string, field: string, options?: AvgAggOptions) =>
    rebuild({ ...state, [name]: { avg: { field, ...(options ?? {}) } } }),

  sum: (name: string, field: string, options?: SumAggOptions) =>
    rebuild({ ...state, [name]: { sum: { field, ...(options ?? {}) } } }),

  min: (name: string, field: string, options?: MinAggOptions) =>
    rebuild({ ...state, [name]: { min: { field, ...(options ?? {}) } } }),

  max: (name: string, field: string, options?: MaxAggOptions) =>
    rebuild({ ...state, [name]: { max: { field, ...(options ?? {}) } } }),

  cardinality: (name: string, field: string, options?: CardinalityAggOptions) =>
    rebuild({ ...state, [name]: { cardinality: { field, ...(options ?? {}) } } }),

  percentiles: (name: string, field: string, options?: PercentilesAggOptions) =>
    rebuild({ ...state, [name]: { percentiles: { field, ...(options ?? {}) } } }),

  stats: (name: string, field: string, options?: StatsAggOptions) =>
    rebuild({ ...state, [name]: { stats: { field, ...(options ?? {}) } } }),

  valueCount: (name: string, field: string, options?: ValueCountAggOptions) =>
    rebuild({ ...state, [name]: { value_count: { field, ...(options ?? {}) } } }),

  extendedStats: (name: string, field: string, options?: ExtendedStatsAggOptions) =>
    rebuild({ ...state, [name]: { extended_stats: { field, ...(options ?? {}) } } }),

  topHits: (name: string, options?: TopHitsAggOptions) =>
    rebuild({ ...state, [name]: { top_hits: { ...(options ?? {}) } } }),

  autoDateHistogram: (name: string, field: string, options?: AutoDateHistogramAggOptions) =>
    rebuild({ ...state, [name]: { auto_date_histogram: { field, ...(options ?? {}) } } }),

  composite: (name: string, sources: CompositeAggSource[], options?: CompositeAggOptions) =>
    rebuild({ ...state, [name]: { composite: { sources, ...(options ?? {}) } } }),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: (name: string, query: Record<string, any>) => rebuild({ ...state, [name]: { filter: query } }),

  // eslint-disable-next-line functional/functional-parameters
  build: () => state
});

const attachSubAgg = (state: AggregationState, subAggState: AggregationState): AggregationState => {
  const lastKey = Object.keys(state).at(-1)!;
  const existing = state[lastKey].aggs ?? {};
  return { ...state, [lastKey]: { ...state[lastKey], aggs: { ...existing, ...subAggState } } };
};

// Function declarations are used for the internal factories (vs const arrows) so that mutual
// recursion between createNestedEntryBuilder and createNestedAggregationBuilder is hoisted.

function createNestedEntryBuilder<
  M extends Record<string, FieldTypeString>,
  N extends Record<string, FieldTypeString>,
  Root extends Record<string, FieldTypeString> = M
>(
  state: AggregationState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rebuild: (state: AggregationState) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): NestedEntryBuilder<M, N, any, Root> {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(sharedAggMethods(state, rebuild) as any),

    global: (name: string) => createAggregationBuilder<M>({ ...state, [name]: { global: {} } }),

    nested: <K extends NestedPathFields<M> & string>(name: string, path: K) =>
      createNestedEntryBuilder<M, SubFieldsOf<M, K>, Root>({ ...state, [name]: { nested: { path } } }, rebuild),

    subAgg: (fn: (agg: NestedAggregationBuilder<N, Root>) => NestedAggregationBuilder<N, Root>) =>
      rebuild(attachSubAgg(state, fn(createNestedAggregationBuilder<N, Root>()).build()))
  };
}

function createNestedAggregationBuilder<
  N extends Record<string, FieldTypeString>,
  Root extends Record<string, FieldTypeString> = N
>(state: AggregationState = {}): NestedAggregationBuilder<N, Root> {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(sharedAggMethods(state, createNestedAggregationBuilder<N, Root>) as any),

    nested: <K extends NestedPathFields<N> & string>(name: string, path: K) =>
      createNestedEntryBuilder<N, SubFieldsOf<N, K>, Root>(
        { ...state, [name]: { nested: { path } } },
        createNestedAggregationBuilder<N, Root>
      ),

    reverseNested: (name: string, path?: string) =>
      createNestedAggregationBuilder<Root, Root>({ ...state, [name]: { reverse_nested: path ? { path } : {} } }),

    subAgg: (fn: (agg: NestedAggregationBuilder<N, Root>) => NestedAggregationBuilder<N, Root>) =>
      createNestedAggregationBuilder<N, Root>(
        attachSubAgg(state, fn(createNestedAggregationBuilder<N, Root>()).build())
      )
  };
}

export function createAggregationBuilder<M extends Record<string, FieldTypeString>>(
  state: AggregationState = {}
): RootAggregationBuilder<M> {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(sharedAggMethods(state, createAggregationBuilder<M>) as any),

    global: (name: string) => createAggregationBuilder<M>({ ...state, [name]: { global: {} } }),

    nested: <K extends NestedPathFields<M> & string>(name: string, path: K) =>
      createNestedEntryBuilder<M, SubFieldsOf<M, K>, M>(
        { ...state, [name]: { nested: { path } } },
        createAggregationBuilder<M>
      ),

    subAgg: (fn: (agg: RootAggregationBuilder<M>) => RootAggregationBuilder<M>) =>
      createAggregationBuilder<M>(attachSubAgg(state, fn(createAggregationBuilder<M>()).build()))
  };
}

export const aggregations = <M extends Record<string, FieldTypeString>>(_schema: MappingsSchema<M>) =>
  createAggregationBuilder<M>();
