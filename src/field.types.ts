/**
 * Per-field-type option types and narrowly-typed mapping return types.
 * Each helper function returns a mapping with a literal `type` field,
 * enabling compile-time field-type inference in the query builder.
 */

import type {
  MappingDenseVectorIndexOptions,
  MappingIndexOptions,
  Script,
  ScriptSource,
  MappingSuggestContext
} from '@elastic/elasticsearch/lib/api/types';
import type { FieldMapping, FieldTypeString } from './index-management.types.js';

/** Options for text fields */
export type TextFieldOptions<
  MF extends Record<string, FieldMappingWithLiteralType> = Record<string, FieldMappingWithLiteralType>
> = {
  analyzer?: string;
  search_analyzer?: string;
  search_quote_analyzer?: string;
  boost?: number;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  similarity?: string;
  fields?: MF;
  copy_to?: string | string[];
  index_options?: MappingIndexOptions;
  index_prefixes?: { min_chars?: number; max_chars?: number };
  index_phrases?: boolean;
  eager_global_ordinals?: boolean;
  position_increment_gap?: number;
  norms?: boolean;
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
export type KeywordFieldOptions<
  MF extends Record<string, FieldMappingWithLiteralType> = Record<string, FieldMappingWithLiteralType>
> = {
  boost?: number;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  similarity?: string;
  normalizer?: string;
  fields?: MF;
  copy_to?: string | string[];
  null_value?: string;
  eager_global_ordinals?: boolean;
  ignore_above?: number;
  split_queries_on_whitespace?: boolean;
  script?: Script | ScriptSource;
  on_script_error?: 'fail' | 'continue';
};

/** Options shared by numeric field types (long, integer, short, byte, double, float, half_float) */
export type NumericFieldOptions<
  MF extends Record<string, FieldMappingWithLiteralType> = Record<string, FieldMappingWithLiteralType>
> = {
  boost?: number;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  coerce?: boolean;
  fields?: MF;
  copy_to?: string | string[];
  null_value?: number;
  ignore_malformed?: boolean;
};

/** Options for scaled_float (extends numeric with scaling_factor) */
export type ScaledFloatFieldOptions<
  MF extends Record<string, FieldMappingWithLiteralType> = Record<string, FieldMappingWithLiteralType>
> = NumericFieldOptions<MF> & {
  scaling_factor?: number;
};

/** Options for unsigned_long fields — null_value accepts string or number for >MAX_SAFE_INTEGER precision */
export type UnsignedLongFieldOptions<
  MF extends Record<string, FieldMappingWithLiteralType> = Record<string, FieldMappingWithLiteralType>
> = Omit<NumericFieldOptions<MF>, 'null_value'> & {
  null_value?: string | number;
};

/** Options for date fields */
export type DateFieldOptions<
  MF extends Record<string, FieldMappingWithLiteralType> = Record<string, FieldMappingWithLiteralType>
> = {
  boost?: number;
  format?: string;
  locale?: string;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  fields?: MF;
  copy_to?: string | string[];
  null_value?: string;
  ignore_malformed?: boolean;
  script?: Script | ScriptSource;
  on_script_error?: 'fail' | 'continue';
};

/**
 * Options for date_nanos fields — same API as `date` but stores timestamps at nanosecond precision.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/date_nanos.html
 */
export type DateNanosFieldOptions<
  MF extends Record<string, FieldMappingWithLiteralType> = Record<string, FieldMappingWithLiteralType>
> = DateFieldOptions<MF>;

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
  index_options?: MappingDenseVectorIndexOptions;
  similarity?: 'cosine' | 'dot_product' | 'l2_norm' | 'max_inner_product';
};

/**
 * Options for `rank_feature` fields — a single-value numeric feature used to boost relevance.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/rank-feature.html
 */
export type RankFeatureFieldOptions = {
  positive_score_impact?: boolean;
};

/**
 * Options for `rank_features` fields — a sparse map of numeric features used to boost relevance.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/rank-features.html
 */
export type RankFeaturesFieldOptions = {
  positive_score_impact?: boolean;
};

/**
 * Options for semantic_text fields (ES 9.x — ML-powered text field for semantic/hybrid search).
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/semantic-text.html
 */
export type SemanticTextFieldOptions = {
  inference_id?: string;
  search_inference_id?: string;
  model_settings?: { task_type?: string; [key: string]: unknown };
};

/** Sub-fields for nested and object field types */
export type NestedFields = Record<string, FieldMapping>;

/** Options for object fields (sub-fields are the first argument) */
export type ObjectFieldOptions = {
  enabled?: boolean;
  dynamic?: boolean | 'strict' | 'runtime';
};

/** Options for nested fields (sub-fields are the first argument) */
export type NestedFieldOptions = {
  enabled?: boolean;
  dynamic?: boolean | 'strict' | 'runtime';
  include_in_parent?: boolean;
  include_in_root?: boolean;
};

/** Options for completion fields */
export type CompletionFieldOptions = {
  analyzer?: string;
  search_analyzer?: string;
  max_input_length?: number;
  preserve_separators?: boolean;
  preserve_position_increments?: boolean;
  contexts?: MappingSuggestContext[];
};

/** Options for geo_point fields */
export type GeoPointFieldOptions = {
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  ignore_malformed?: boolean;
  ignore_z_value?: boolean;
  null_value?: string | { lat: number; lon: number };
  copy_to?: string | string[];
  script?: Script | ScriptSource;
  on_script_error?: 'fail' | 'continue';
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

/**
 * Options for `ip_range` fields — range of IPv4 or IPv6 addresses.
 * Mirrors numeric `RangeFieldOptions` but conceptually scoped to IP ranges.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/range.html
 */
export type IpRangeFieldOptions = {
  boost?: number;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  coerce?: boolean;
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
export type MatchOnlyTextFieldOptions<
  MF extends Record<string, FieldMappingWithLiteralType> = Record<string, FieldMappingWithLiteralType>
> = {
  fields?: MF;
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
  search_quote_analyzer?: string;
  max_shingle_size?: 2 | 3 | 4;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  similarity?: string;
  norms?: boolean;
  term_vector?:
    | 'no'
    | 'yes'
    | 'with_positions'
    | 'with_offsets'
    | 'with_positions_offsets'
    | 'with_positions_payloads'
    | 'with_positions_offsets_payloads';
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

/**
 * Options for token_count fields — counts the number of tokens in a string.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/token-count.html
 */
export type TokenCountFieldOptions = {
  analyzer?: string;
  boost?: number;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  null_value?: number;
  enable_position_increments?: boolean;
};

/**
 * Options for join fields — defines parent/child relationships within a single index.
 * `relations` is required and maps parent names to child names.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/parent-join.html
 */
export type JoinFieldOptions = {
  relations: Record<string, string | string[]>;
  eager_global_ordinals?: boolean;
};

// ---------------------------------------------------------------------------
// Narrowly-typed mapping return types — each narrows `type` to a literal
// ---------------------------------------------------------------------------

export type TypedFieldMapping<T extends string> = Omit<FieldMapping, 'type'> & {
  type: T;
};

// ---------------------------------------------------------------------------
// FieldMappingWithLiteralType — any field mapping whose type is a known ES literal
// Used by mappings() to constrain field helper inputs and enable compile-time inference
// ---------------------------------------------------------------------------

export type FieldMappingWithLiteralType = FieldMapping & { type: FieldTypeString };

// ---------------------------------------------------------------------------
// TypedNestedFieldMapping / TypedObjectFieldMapping
// Returned by nested() and object() when called with typed sub-fields.
// The phantom _subFields property carries sub-field type info for Infer<> and
// dot-notation expansion in M — it is undefined at runtime and stripped by
// JSON.stringify before reaching Elasticsearch.
// ---------------------------------------------------------------------------

/**
 * Typed variant of `NestedFieldMapping` carrying sub-field type info at compile time.
 * Produced when `nested()` is called with a typed field map.
 */
export type TypedNestedFieldMapping<F extends Record<string, FieldMappingWithLiteralType>> = NestedFieldMapping &
  Readonly<{ _subFields: F }>;

/**
 * Typed variant of `ObjectFieldMapping` carrying sub-field type info at compile time.
 * Produced when `object()` is called with a typed field map.
 */
export type TypedObjectFieldMapping<F extends Record<string, FieldMappingWithLiteralType>> = ObjectFieldMapping &
  Readonly<{ _subFields: F }>;

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
export type SparseVectorFieldMapping = TypedFieldMapping<'sparse_vector'>;
export type RankFeatureFieldMapping = TypedFieldMapping<'rank_feature'>;
export type RankFeaturesFieldMapping = TypedFieldMapping<'rank_features'>;
export type SemanticTextFieldMapping = TypedFieldMapping<'semantic_text'>;
export type UnsignedLongFieldMapping = TypedFieldMapping<'unsigned_long'>;
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
export type IpRangeFieldMapping = TypedFieldMapping<'ip_range'>;
export type DateNanosFieldMapping = TypedFieldMapping<'date_nanos'>;
export type MatchOnlyTextFieldMapping = TypedFieldMapping<'match_only_text'>;
export type SearchAsYouTypeFieldMapping = TypedFieldMapping<'search_as_you_type'>;
export type ConstantKeywordFieldMapping = TypedFieldMapping<'constant_keyword'>;
export type WildcardFieldMapping = TypedFieldMapping<'wildcard'>;
export type FlattenedFieldMapping = TypedFieldMapping<'flattened'>;
export type TokenCountFieldMapping = TypedFieldMapping<'token_count'>;
export type Murmur3FieldMapping = TypedFieldMapping<'murmur3'>;
export type JoinFieldMapping = TypedFieldMapping<'join'>;
