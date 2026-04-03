import type { FieldTypeString } from './index-management.types.js';
import type { MappingsSchema } from './mapping.types.js';
import { createQueryBuilder } from './query.builder.js';

// Search API
export const queryBuilder = <M extends Record<string, FieldTypeString>>(
  _schema: MappingsSchema<M>,
  includeQuery: boolean = true
) => createQueryBuilder<M>({ _includeQuery: includeQuery });
export type {
  QueryBuilder,
  ClauseBuilder,
  FunctionScoreOptions,
  HasChildOptions,
  HasParentOptions,
  ParentIdOptions,
  IntervalsOptions,
  SpanNearOptions,
  SpanNotOptions,
  SpanQuery
} from './query.types.js';

// Aggregations API
export { aggregations } from './aggregation.builder.js';
export type { RootAggregationBuilder, NestedAggregationBuilder, NestedEntryBuilder } from './aggregation.types.js';

// Mappings API
export { mappings } from './mapping.builder.js';
export {
  text,
  keyword,
  long,
  integer,
  short,
  byte,
  double,
  float,
  halfFloat,
  scaledFloat,
  date,
  dateNanos,
  boolean,
  binary,
  ip,
  denseVector,
  geoPoint,
  geoShape,
  completion,
  nested,
  object,
  alias,
  percolator,
  integerRange,
  floatRange,
  longRange,
  doubleRange,
  dateRange,
  ipRange,
  matchOnlyText,
  searchAsYouType,
  constantKeyword,
  wildcardField,
  flattened,
  quantizedDenseVector,
  sparseVector,
  rankFeature,
  rankFeatures,
  semanticText,
  unsignedLong,
  tokenCount,
  murmur3Hash,
  join
} from './field.helpers.js';
export type {
  MappingsSchema,
  Infer,
  FieldsOfType,
  TextFields,
  KeywordFields,
  NumericFields,
  DateFields,
  BooleanFields,
  GeoPointFields,
  GeoShapeFields,
  VectorFields,
  DenseVectorFields,
  SparseVectorFields,
  RankFeatureFields,
  CompletionFields,
  IpFields
} from './mapping.types.js';
export type {
  FieldMappingWithLiteralType,
  TypedNestedFieldMapping,
  TypedObjectFieldMapping,
  UnsignedLongFieldOptions,
  DateNanosFieldOptions,
  IpRangeFieldOptions,
  NestedFieldOptions,
  ObjectFieldOptions,
  TokenCountFieldOptions,
  JoinFieldOptions
} from './field.types.js';

// Multi-search API
export { msearch } from './multi-search.builder.js';
export type { MSearchBuilder, MSearchHeader, MSearchRequestParams } from './multi-search.types.js';

// Bulk API
export { bulk } from './bulk.builder.js';
export type { BulkBuilder, BulkOperationContainer } from './bulk.types.js';

// Index Management API
export { indexBuilder } from './index-management.builder.js';
export type {
  IndexBuilder,
  AnalysisConfig,
  AnalysisAnalyzerConfig,
  AnalysisTokenizerConfig,
  AnalysisTokenFilterConfig,
  AnalysisCharFilterConfig,
  AnalysisNormalizerConfig
} from './index-management.types.js';

// Suggester API
export { suggest } from './suggester.builder.js';
export type {
  SuggesterBuilder,
  TermSuggesterOptions,
  PhraseSuggesterOptions,
  CompletionSuggesterOptions,
  PhraseSuggestDirectGenerator,
  PhraseSuggestCollate,
  PhraseSuggestSmoothingModel,
  CompletionSuggestContext
} from './suggester.types.js';

// Settings Presets
export { productionSearchSettings, indexSortSettings, fastIngestSettings } from './settings.presets.js';
export type { IndexSortFieldSpec } from './settings.presets.js';
