/**
 * Field type helper functions for ergonomic index mapping definitions.
 * Each helper returns a FieldMapping with `type` pre-filled and only accepts
 * options relevant to that specific field type.
 *
 * @example
 * import { text, keyword, denseVector } from 'elasticlink';
 *
 * indexBuilder<Product>()
 *   .mappings({
 *     name: text({ analyzer: 'standard' }),
 *     price: 'float',
 *     category: 'keyword',
 *     embedding: denseVector({ dims: 384 }),
 *   })
 */

import type {
  FieldMapping,
  FieldMappingInput
} from './index-management.types.js';
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
  RangeFieldOptions
} from './field.types.js';

// Text & keyword
export const text = (options?: TextFieldOptions): FieldMapping => ({
  type: 'text',
  ...options
});
export const keyword = (options?: KeywordFieldOptions): FieldMapping => ({
  type: 'keyword',
  ...options
});

// Numeric
export const long = (options?: NumericFieldOptions): FieldMapping => ({
  type: 'long',
  ...options
});
export const integer = (options?: NumericFieldOptions): FieldMapping => ({
  type: 'integer',
  ...options
});
export const short = (options?: NumericFieldOptions): FieldMapping => ({
  type: 'short',
  ...options
});
export const byte = (options?: NumericFieldOptions): FieldMapping => ({
  type: 'byte',
  ...options
});
export const double = (options?: NumericFieldOptions): FieldMapping => ({
  type: 'double',
  ...options
});
export const float = (options?: NumericFieldOptions): FieldMapping => ({
  type: 'float',
  ...options
});
export const halfFloat = (options?: NumericFieldOptions): FieldMapping => ({
  type: 'half_float',
  ...options
});
export const scaledFloat = (
  options?: ScaledFloatFieldOptions
): FieldMapping => ({ type: 'scaled_float', ...options });

// Date & boolean
export const date = (options?: DateFieldOptions): FieldMapping => ({
  type: 'date',
  ...options
});
export const boolean = (options?: BooleanFieldOptions): FieldMapping => ({
  type: 'boolean',
  ...options
});

// Binary
export const binary = (): FieldMapping => ({ type: 'binary' });

// IP
export const ip = (options?: IpFieldOptions): FieldMapping => ({
  type: 'ip',
  ...options
});

// Vector
export const denseVector = (
  options?: DenseVectorFieldOptions
): FieldMapping => ({ type: 'dense_vector', ...options });

// Geo
export const geoPoint = (options?: GeoPointFieldOptions): FieldMapping => ({
  type: 'geo_point',
  ...options
});
export const geoShape = (options?: GeoShapeFieldOptions): FieldMapping => ({
  type: 'geo_shape',
  ...options
});

// Completion
export const completion = (options?: CompletionFieldOptions): FieldMapping => ({
  type: 'completion',
  ...options
});

// Structured
export const nested = (fields?: NestedFields): FieldMapping => ({
  type: 'nested',
  ...(fields && { properties: resolveProperties(fields) })
});
export const object = (
  fields?: NestedFields,
  options?: ObjectFieldOptions
): FieldMapping => ({
  type: 'object',
  ...(options?.enabled !== undefined && { enabled: options.enabled }),
  ...(fields && { properties: resolveProperties(fields) })
});

// Alias
export const alias = (options?: AliasFieldOptions): FieldMapping => ({
  type: 'alias',
  ...options
});

// Percolator
export const percolator = (): FieldMapping => ({ type: 'percolator' });

// Range types
export const integerRange = (options?: RangeFieldOptions): FieldMapping => ({
  type: 'integer_range',
  ...options
});
export const floatRange = (options?: RangeFieldOptions): FieldMapping => ({
  type: 'float_range',
  ...options
});
export const longRange = (options?: RangeFieldOptions): FieldMapping => ({
  type: 'long_range',
  ...options
});
export const doubleRange = (options?: RangeFieldOptions): FieldMapping => ({
  type: 'double_range',
  ...options
});
export const dateRange = (options?: RangeFieldOptions): FieldMapping => ({
  type: 'date_range',
  ...options
});

/**
 * Resolves a FieldMappingInput to a FieldMapping.
 * Converts shorthand strings like 'text' to { type: 'text' }.
 */
export const resolveField = (input: FieldMappingInput): FieldMapping =>
  typeof input === 'string' ? { type: input } : input;

const resolveProperties = (
  props: Record<string, FieldMappingInput>
): Record<string, FieldMapping> =>
  Object.fromEntries(
    Object.entries(props).map(([k, v]) => [k, resolveField(v)])
  );
