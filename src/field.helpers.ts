/**
 * Field type helper functions for ergonomic index mapping definitions.
 * Each helper returns a narrowly-typed mapping with a literal `type` field,
 * enabling compile-time field-type inference in the query builder.
 *
 * @example
 * import { text, keyword, denseVector, mappings } from 'elasticlink';
 *
 * const productMappings = mappings({
 *   name: text({ analyzer: 'standard' }),
 *   price: float(),
 *   category: keyword(),
 *   embedding: denseVector({ dims: 384 }),
 * });
 */

import type { FieldMapping } from './index-management.types.js';
import type {
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
  RangeFieldOptions,
  TextFieldMapping,
  KeywordFieldMapping,
  LongFieldMapping,
  IntegerFieldMapping,
  ShortFieldMapping,
  ByteFieldMapping,
  DoubleFieldMapping,
  FloatFieldMapping,
  HalfFloatFieldMapping,
  ScaledFloatFieldMapping,
  DateFieldMapping,
  BooleanFieldMapping,
  BinaryFieldMapping,
  IpFieldMapping,
  DenseVectorFieldMapping,
  GeoPointFieldMapping,
  GeoShapeFieldMapping,
  CompletionFieldMapping,
  NestedFieldMapping,
  ObjectFieldMapping,
  AliasFieldMapping,
  PercolatorFieldMapping,
  IntegerRangeFieldMapping,
  FloatRangeFieldMapping,
  LongRangeFieldMapping,
  DoubleRangeFieldMapping,
  DateRangeFieldMapping
} from './field.types.js';

// Text & keyword
export const text = (options?: TextFieldOptions): TextFieldMapping => ({
  type: 'text',
  ...options
});
export const keyword = (
  options?: KeywordFieldOptions
): KeywordFieldMapping => ({
  type: 'keyword',
  ...options
});

// Numeric
export const long = (options?: NumericFieldOptions): LongFieldMapping => ({
  type: 'long',
  ...options
});
export const integer = (
  options?: NumericFieldOptions
): IntegerFieldMapping => ({
  type: 'integer',
  ...options
});
export const short = (options?: NumericFieldOptions): ShortFieldMapping => ({
  type: 'short',
  ...options
});
export const byte = (options?: NumericFieldOptions): ByteFieldMapping => ({
  type: 'byte',
  ...options
});
export const double = (options?: NumericFieldOptions): DoubleFieldMapping => ({
  type: 'double',
  ...options
});
export const float = (options?: NumericFieldOptions): FloatFieldMapping => ({
  type: 'float',
  ...options
});
export const halfFloat = (
  options?: NumericFieldOptions
): HalfFloatFieldMapping => ({
  type: 'half_float',
  ...options
});
export const scaledFloat = (
  options?: ScaledFloatFieldOptions
): ScaledFloatFieldMapping => ({ type: 'scaled_float', ...options });

// Date & boolean
export const date = (options?: DateFieldOptions): DateFieldMapping => ({
  type: 'date',
  ...options
});
export const boolean = (
  options?: BooleanFieldOptions
): BooleanFieldMapping => ({
  type: 'boolean',
  ...options
});

// Binary
export const binary = (): BinaryFieldMapping => ({ type: 'binary' });

// IP
export const ip = (options?: IpFieldOptions): IpFieldMapping => ({
  type: 'ip',
  ...options
});

// Vector
export const denseVector = (
  options?: DenseVectorFieldOptions
): DenseVectorFieldMapping => ({ type: 'dense_vector', ...options });

// Geo
export const geoPoint = (
  options?: GeoPointFieldOptions
): GeoPointFieldMapping => ({
  type: 'geo_point',
  ...options
});
export const geoShape = (
  options?: GeoShapeFieldOptions
): GeoShapeFieldMapping => ({
  type: 'geo_shape',
  ...options
});

// Completion
export const completion = (
  options?: CompletionFieldOptions
): CompletionFieldMapping => ({
  type: 'completion',
  ...options
});

// Structured
export const nested = (fields?: NestedFields): NestedFieldMapping => ({
  type: 'nested',
  ...(fields && { properties: fields })
});
export const object = (
  fields?: NestedFields,
  options?: ObjectFieldOptions
): ObjectFieldMapping => ({
  type: 'object',
  ...(options?.enabled !== undefined && { enabled: options.enabled }),
  ...(fields && { properties: fields })
});

// Alias
export const alias = (options?: AliasFieldOptions): AliasFieldMapping => ({
  type: 'alias',
  ...options
});

// Percolator
export const percolator = (): PercolatorFieldMapping => ({
  type: 'percolator'
});

// Range types
export const integerRange = (
  options?: RangeFieldOptions
): IntegerRangeFieldMapping => ({
  type: 'integer_range',
  ...options
});
export const floatRange = (
  options?: RangeFieldOptions
): FloatRangeFieldMapping => ({
  type: 'float_range',
  ...options
});
export const longRange = (
  options?: RangeFieldOptions
): LongRangeFieldMapping => ({
  type: 'long_range',
  ...options
});
export const doubleRange = (
  options?: RangeFieldOptions
): DoubleRangeFieldMapping => ({
  type: 'double_range',
  ...options
});
export const dateRange = (
  options?: RangeFieldOptions
): DateRangeFieldMapping => ({
  type: 'date_range',
  ...options
});

export const resolveField = (input: FieldMapping): FieldMapping => input;
