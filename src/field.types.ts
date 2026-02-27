/**
 * Per-field-type option types and narrowly-typed mapping return types.
 * Each helper function returns a mapping with a literal `type` field,
 * enabling compile-time field-type inference in the query builder.
 */

import type { FieldMapping } from './index-management.types.js';

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
  copy_to?: string | string[];
  index_prefixes?: { min_chars?: number; max_chars?: number };
  index_phrases?: boolean;
  eager_global_ordinals?: boolean;
  term_vector?:
    | 'no'
    | 'yes'
    | 'with_positions'
    | 'with_offsets'
    | 'with_positions_offsets'
    | 'with_positions_payloads'
    | 'with_positions_offsets_payloads';
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
  copy_to?: string | string[];
  null_value?: string;
  eager_global_ordinals?: boolean;
  ignore_above?: number;
};

/** Options shared by numeric field types (long, integer, short, byte, double, float, half_float) */
export type NumericFieldOptions = {
  boost?: number;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  coerce?: boolean;
  fields?: Record<string, FieldMapping>;
  copy_to?: string | string[];
  null_value?: number;
  ignore_malformed?: boolean;
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
  copy_to?: string | string[];
  null_value?: string;
  ignore_malformed?: boolean;
};

/** Options for boolean fields */
export type BooleanFieldOptions = {
  boost?: number;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  null_value?: boolean;
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
export type NestedFields = Record<string, FieldMapping>;

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
  ignore_malformed?: boolean;
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
  path: string;
};

/** Options for ip fields */
export type IpFieldOptions = {
  boost?: number;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  null_value?: string;
  ignore_malformed?: boolean;
};

/** Options for range fields (integer_range, float_range, long_range, double_range, date_range) */
export type RangeFieldOptions = {
  boost?: number;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  coerce?: boolean;
};

/**
 * Options for match_only_text fields.
 * Use when you only need filter/match but not relevance scoring — faster and uses less disk.
 */
export type MatchOnlyTextFieldOptions = {
  fields?: Record<string, FieldMapping>;
  copy_to?: string | string[];
  meta?: Record<string, string>;
};

/**
 * Options for search_as_you_type fields.
 * Provides out-of-the-box autocomplete / typeahead capabilities.
 */
export type SearchAsYouTypeFieldOptions = {
  analyzer?: string;
  search_analyzer?: string;
  max_shingle_size?: number;
  index?: boolean;
  similarity?: string;
};

/**
 * Options for constant_keyword fields.
 * Every document in the index has the same value for this field.
 * Useful for multi-index queries to identify the index type.
 */
export type ConstantKeywordFieldOptions = {
  value?: string;
};

/**
 * Options for wildcard fields.
 * Optimized for grep-like wildcard/regexp queries on high-cardinality or large fields.
 * Use instead of keyword when leading wildcards (`*foo`) are needed.
 */
export type WildcardFieldOptions = {
  null_value?: string;
  ignore_above?: number;
};

/**
 * Options for flattened fields.
 * Flattens complex/dynamic objects into a single field. Faster than nested,
 * but only supports keyword-level queries on inner values.
 */
export type FlattenedFieldOptions = {
  depth_limit?: number;
  doc_values?: boolean;
  index?: boolean;
  null_value?: string;
  similarity?: string;
  eager_global_ordinals?: boolean;
};

// ---------------------------------------------------------------------------
// Narrowly-typed mapping return types — each narrows `type` to a literal
// ---------------------------------------------------------------------------

export type TypedFieldMapping<T extends string> = Omit<FieldMapping, 'type'> & {
  type: T;
};

export type TextFieldMapping = TypedFieldMapping<'text'>;
export type KeywordFieldMapping = TypedFieldMapping<'keyword'>;
export type LongFieldMapping = TypedFieldMapping<'long'>;
export type IntegerFieldMapping = TypedFieldMapping<'integer'>;
export type ShortFieldMapping = TypedFieldMapping<'short'>;
export type ByteFieldMapping = TypedFieldMapping<'byte'>;
export type DoubleFieldMapping = TypedFieldMapping<'double'>;
export type FloatFieldMapping = TypedFieldMapping<'float'>;
export type HalfFloatFieldMapping = TypedFieldMapping<'half_float'>;
export type ScaledFloatFieldMapping = TypedFieldMapping<'scaled_float'>;
export type DateFieldMapping = TypedFieldMapping<'date'>;
export type BooleanFieldMapping = TypedFieldMapping<'boolean'>;
export type BinaryFieldMapping = TypedFieldMapping<'binary'>;
export type IpFieldMapping = TypedFieldMapping<'ip'>;
export type DenseVectorFieldMapping = TypedFieldMapping<'dense_vector'>;
export type GeoPointFieldMapping = TypedFieldMapping<'geo_point'>;
export type GeoShapeFieldMapping = TypedFieldMapping<'geo_shape'>;
export type CompletionFieldMapping = TypedFieldMapping<'completion'>;
export type NestedFieldMapping = TypedFieldMapping<'nested'>;
export type ObjectFieldMapping = TypedFieldMapping<'object'>;
export type AliasFieldMapping = TypedFieldMapping<'alias'>;
export type PercolatorFieldMapping = TypedFieldMapping<'percolator'>;
export type IntegerRangeFieldMapping = TypedFieldMapping<'integer_range'>;
export type FloatRangeFieldMapping = TypedFieldMapping<'float_range'>;
export type LongRangeFieldMapping = TypedFieldMapping<'long_range'>;
export type DoubleRangeFieldMapping = TypedFieldMapping<'double_range'>;
export type DateRangeFieldMapping = TypedFieldMapping<'date_range'>;
export type MatchOnlyTextFieldMapping = TypedFieldMapping<'match_only_text'>;
export type SearchAsYouTypeFieldMapping = TypedFieldMapping<'search_as_you_type'>;
export type ConstantKeywordFieldMapping = TypedFieldMapping<'constant_keyword'>;
export type WildcardFieldMapping = TypedFieldMapping<'wildcard'>;
export type FlattenedFieldMapping = TypedFieldMapping<'flattened'>;
