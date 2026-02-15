import { createQueryBuilder } from './query.builder.js';
import { createAggregationBuilder } from './aggregation.builder.js';

// Search API
export const query = <T>(includeQuery: boolean = true) =>
  createQueryBuilder<T>({ _includeQuery: includeQuery });
export const aggregations = <T>() => createAggregationBuilder<T>();

// Multi-search API
export { msearch, createMSearchBuilder } from './multi-search.builder.js';
export type {
  MSearchBuilder,
  MSearchRequest,
  MSearchHeader
} from './multi-search.types.js';

// Bulk API
export { bulk, createBulkBuilder } from './bulk.builder.js';
export type {
  BulkBuilder,
  BulkIndexMeta,
  BulkCreateMeta,
  BulkUpdateMeta,
  BulkDeleteMeta
} from './bulk.types.js';

// Index Management API
export {
  indexBuilder,
  createIndexBuilder
} from './index-management.builder.js';
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
  dateRange
} from './field.helpers.js';
export type {
  IndexBuilder,
  IndexMappings,
  IndexSettings,
  CreateIndexOptions,
  FieldMapping,
  FieldTypeString,
  FieldMappingInput,
  MappingsInput
} from './index-management.types.js';
export type {
  TextFieldOptions,
  KeywordFieldOptions,
  NumericFieldOptions,
  ScaledFloatFieldOptions,
  DateFieldOptions,
  BooleanFieldOptions,
  DenseVectorFieldOptions,
  NestedFields,
  ObjectFieldOptions,
  CompletionFieldOptions,
  GeoPointFieldOptions,
  GeoShapeFieldOptions,
  AliasFieldOptions,
  IpFieldOptions,
  RangeFieldOptions
} from './field.types.js';

// Suggester API
export { suggest, createSuggesterBuilder } from './suggester.builder.js';
export type {
  SuggesterBuilder,
  SuggesterState,
  TermSuggesterOptions,
  PhraseSuggesterOptions,
  CompletionSuggesterOptions
} from './suggester.types.js';

// Export types
export type { KnnOptions, DenseVectorOptions } from './vector.types.js';
