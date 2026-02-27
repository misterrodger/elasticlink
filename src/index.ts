import type { FieldTypeString } from './index-management.types.js';
import type { MappingsSchema } from './mapping.types.js';
import { createQueryBuilder } from './query.builder.js';

// Search API
export const query = <M extends Record<string, FieldTypeString>>(
  _schema: MappingsSchema<M>,
  includeQuery: boolean = true
) => createQueryBuilder<M>({ _includeQuery: includeQuery });
export type { QueryBuilder, ClauseBuilder } from './query.types.js';

// Aggregations API
export { aggregations } from './aggregation.builder.js';
export type { AggregationBuilder } from './aggregation.types.js';

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
  matchOnlyText,
  searchAsYouType,
  constantKeyword,
  wildcardField,
  flattened,
  quantizedDenseVector
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
  VectorFields,
  IpFields
} from './mapping.types.js';

// Multi-search API
export { msearch } from './multi-search.builder.js';
export type { MSearchBuilder } from './multi-search.types.js';

// Bulk API
export { bulk } from './bulk.builder.js';
export type { BulkBuilder } from './bulk.types.js';

// Index Management API
export { indexBuilder } from './index-management.builder.js';
export type { IndexBuilder } from './index-management.types.js';

// Suggester API
export { suggest } from './suggester.builder.js';
export type { SuggesterBuilder } from './suggester.types.js';

// Settings Presets
export { productionSearchSettings, indexSortSettings, fastIngestSettings } from './settings.presets.js';
