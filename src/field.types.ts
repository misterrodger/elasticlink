/**
 * Per-field-type option types for field helper functions.
 * Each type only includes options relevant to that specific field type,
 * providing type-safe autocomplete in helper functions.
 */

import type {
  FieldMapping,
  FieldMappingInput
} from './index-management.types.js';

/** Options for text fields */
export type TextFieldOptions = {
  analyzer?: string;
  search_analyzer?: string;
  boost?: number;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  similarity?: string;
  fields?: Record<string, FieldMapping>;
};

/** Options for keyword fields */
export type KeywordFieldOptions = {
  boost?: number;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  similarity?: string;
  normalizer?: string;
  fields?: Record<string, FieldMapping>;
};

/** Options shared by numeric field types (long, integer, short, byte, double, float, half_float) */
export type NumericFieldOptions = {
  boost?: number;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  coerce?: boolean;
  fields?: Record<string, FieldMapping>;
};

/** Options for scaled_float (extends numeric with scaling_factor) */
export type ScaledFloatFieldOptions = NumericFieldOptions & {
  scaling_factor?: number;
};

/** Options for date fields */
export type DateFieldOptions = {
  boost?: number;
  format?: string;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  fields?: Record<string, FieldMapping>;
};

/** Options for boolean fields */
export type BooleanFieldOptions = {
  boost?: number;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
};

/** Options for dense_vector fields */
export type DenseVectorFieldOptions = {
  dims?: number;
  element_type?: 'float' | 'byte' | 'bit';
  index?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  index_options?: any;
  similarity?: 'cosine' | 'dot_product' | 'l2_norm' | 'max_inner_product';
};

/** Sub-fields for nested and object field types */
export type NestedFields = Record<string, FieldMappingInput>;

/** Options for object fields (enabled flag only — sub-fields are the first argument) */
export type ObjectFieldOptions = {
  enabled?: boolean;
};

/** Options for completion fields */
export type CompletionFieldOptions = {
  analyzer?: string;
  search_analyzer?: string;
  max_input_length?: number;
  preserve_separators?: boolean;
  preserve_position_increments?: boolean;
};

/** Options for geo_point fields */
export type GeoPointFieldOptions = {
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
};

/** Options for geo_shape fields */
export type GeoShapeFieldOptions = {
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  orientation?: string;
  ignore_malformed?: boolean;
};

/** Options for alias fields */
export type AliasFieldOptions = {
  path?: string;
};

/** Options for ip fields */
export type IpFieldOptions = {
  boost?: number;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
};

/** Options for range fields (integer_range, float_range, long_range, double_range, date_range) */
export type RangeFieldOptions = {
  boost?: number;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  coerce?: boolean;
};
