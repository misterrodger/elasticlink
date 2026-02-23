/**
 * Mapping schema types for compile-time field-type safety.
 * MappingsSchema carries both runtime ES properties and a phantom type M
 * that maps field names to their ES type literals.
 */

import type {
  FieldMapping,
  FieldTypeString
} from './index-management.types.js';

// ---------------------------------------------------------------------------
// MappingsSchema — the artifact produced by mappings()
// ---------------------------------------------------------------------------

export type MappingsSchema<M extends Record<string, FieldTypeString>> = {
  readonly _fieldTypes: M;
  readonly properties: Record<string, FieldMapping>;
};

// ---------------------------------------------------------------------------
// Infer<S> — derive a plain TS type from a MappingsSchema
// ---------------------------------------------------------------------------

type ESTypeToTS = {
  text: string;
  keyword: string;
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
  nested: unknown;
  object: unknown;
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
        [K in keyof M]: M[K] extends keyof ESTypeToTS
          ? ESTypeToTS[M[K]]
          : unknown;
      }
    : never;

// ---------------------------------------------------------------------------
// Field group filter types — extract field names by ES type
// ---------------------------------------------------------------------------

export type FieldsOfType<
  M extends Record<string, FieldTypeString>,
  Types extends FieldTypeString
> = { [K in keyof M]: M[K] extends Types ? K : never }[keyof M];

export type TextFields<M extends Record<string, FieldTypeString>> =
  FieldsOfType<M, 'text'>;

export type KeywordFields<M extends Record<string, FieldTypeString>> =
  FieldsOfType<M, 'keyword'>;

export type NumericFields<M extends Record<string, FieldTypeString>> =
  FieldsOfType<
    M,
    | 'long'
    | 'integer'
    | 'short'
    | 'byte'
    | 'double'
    | 'float'
    | 'half_float'
    | 'scaled_float'
  >;

export type DateFields<M extends Record<string, FieldTypeString>> =
  FieldsOfType<M, 'date'>;

export type BooleanFields<M extends Record<string, FieldTypeString>> =
  FieldsOfType<M, 'boolean'>;

export type GeoPointFields<M extends Record<string, FieldTypeString>> =
  FieldsOfType<M, 'geo_point'>;

export type VectorFields<M extends Record<string, FieldTypeString>> =
  FieldsOfType<M, 'dense_vector'>;
