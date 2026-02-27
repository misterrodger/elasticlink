/**
 * Mapping schema types for compile-time field-type safety.
 * MappingsSchema carries both runtime ES properties and a phantom type M
 * that maps field names to their ES type literals.
 */

import type { FieldMapping, FieldTypeString, SourceConfig } from './index-management.types.js';

// ---------------------------------------------------------------------------
// MappingOptions — configuration for the mappings() factory
// ---------------------------------------------------------------------------

/**
 * Options for `mappings()`.
 *
 * @param dynamic - Controls how unmapped fields are handled. Defaults to `'strict'`
 *   to prevent unmapped fields from being silently indexed. Set to `true` to allow
 *   dynamic mapping, or `'runtime'` for runtime fields.
 * @param _source - Configure which fields are stored in `_source`.
 *   Use `{ excludes: ['embedding'] }` to prune large dense_vector fields from
 *   returned `_source` — they remain searchable via kNN but won't bloat query responses.
 * @param _meta - Custom metadata to attach to the mapping.
 */
export type MappingOptions = {
  dynamic?: boolean | 'strict' | 'runtime';
  _source?: SourceConfig;
  _meta?: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// MappingsSchema — the artifact produced by mappings()
// ---------------------------------------------------------------------------

export type MappingsSchema<M extends Record<string, FieldTypeString>> = Readonly<{
  _fieldTypes: M;
  properties: Record<string, FieldMapping>;
  _mappingOptions?: MappingOptions;
}>;

// ---------------------------------------------------------------------------
// Infer<S> — derive a plain TS type from a MappingsSchema
// ---------------------------------------------------------------------------

type ESTypeToTS = {
  text: string;
  match_only_text: string;
  keyword: string;
  constant_keyword: string;
  wildcard: string;
  long: number;
  integer: number;
  short: number;
  byte: number;
  float: number;
  double: number;
  half_float: number;
  scaled_float: number;
  date: string;
  boolean: boolean;
  binary: string;
  ip: string;
  geo_point: { lat: number; lon: number };
  geo_shape: Record<string, unknown>;
  dense_vector: number[];
  completion: string;
  search_as_you_type: string;
  nested: unknown;
  object: unknown;
  flattened: Record<string, unknown>;
  alias: unknown;
  percolator: unknown;
  integer_range: { gte?: number; lte?: number; gt?: number; lt?: number };
  float_range: { gte?: number; lte?: number; gt?: number; lt?: number };
  long_range: { gte?: number; lte?: number; gt?: number; lt?: number };
  double_range: { gte?: number; lte?: number; gt?: number; lt?: number };
  date_range: { gte?: string; lte?: string; gt?: string; lt?: string };
};

export type Infer<S> =
  S extends MappingsSchema<infer M>
    ? {
        [K in keyof M]: M[K] extends keyof ESTypeToTS ? ESTypeToTS[M[K]] : unknown;
      }
    : never;

// ---------------------------------------------------------------------------
// Field group filter types — extract field names by ES type
// ---------------------------------------------------------------------------

export type FieldsOfType<M extends Record<string, FieldTypeString>, Types extends FieldTypeString> = {
  [K in keyof M]: M[K] extends Types ? K : never;
}[keyof M];

export type TextFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  M,
  'text' | 'match_only_text' | 'search_as_you_type'
>;

export type KeywordFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  M,
  'keyword' | 'constant_keyword' | 'wildcard'
>;

export type NumericFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  M,
  'long' | 'integer' | 'short' | 'byte' | 'double' | 'float' | 'half_float' | 'scaled_float'
>;

export type DateFields<M extends Record<string, FieldTypeString>> = FieldsOfType<M, 'date'>;

export type BooleanFields<M extends Record<string, FieldTypeString>> = FieldsOfType<M, 'boolean'>;

export type GeoPointFields<M extends Record<string, FieldTypeString>> = FieldsOfType<M, 'geo_point'>;

export type VectorFields<M extends Record<string, FieldTypeString>> = FieldsOfType<M, 'dense_vector'>;

export type IpFields<M extends Record<string, FieldTypeString>> = FieldsOfType<M, 'ip'>;
