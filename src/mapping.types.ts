/**
 * Mapping schema types for compile-time field-type safety.
 * MappingsSchema carries both runtime ES properties and a phantom type M
 * that maps field names to their ES type literals.
 */

import type { FieldMapping, FieldTypeString, SourceConfig } from './index-management.types.js';
import type { FieldMappingWithLiteralType } from './field.types.js';

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

export type MappingsSchema<
  M extends Record<string, FieldTypeString>,
  F extends Record<string, FieldMappingWithLiteralType> = Record<string, FieldMappingWithLiteralType>
> = Readonly<{
  _fieldTypes: M;
  _fields?: F;
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
  date_nanos: string;
  boolean: boolean;
  binary: string;
  ip: string;
  geo_point: { lat: number; lon: number };
  geo_shape: Record<string, unknown>;
  dense_vector: number[];
  sparse_vector: Record<string, number>;
  semantic_text: string;
  unsigned_long: number | string;
  completion: string | { input: string[]; weight?: number };
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
  ip_range: { gte?: string; lte?: string; gt?: string; lt?: string } | string;
  token_count: string | number;
  murmur3: string;
  join: string | { name: string; parent?: string };
  rank_feature: number;
  rank_features: Record<string, number>;
};

type InferSubFields<F extends Record<string, FieldMappingWithLiteralType>> = {
  [K in keyof F]: F[K] extends { _subFields: infer Sub extends Record<string, FieldMappingWithLiteralType> }
    ? F[K] extends { type: 'nested' }
      ? Array<InferSubFields<Sub>>
      : InferSubFields<Sub>
    : F[K]['type'] extends keyof ESTypeToTS
      ? ESTypeToTS[F[K]['type']]
      : unknown;
};

export type Infer<S> = S extends MappingsSchema<infer _M, infer F> ? InferSubFields<F> : never;

// ---------------------------------------------------------------------------
// Field group filter types — extract field names by ES type
// ---------------------------------------------------------------------------

export type FieldsOfType<M extends Record<string, FieldTypeString>, Types extends FieldTypeString> = {
  [K in keyof M]: M[K] extends Types ? K : never;
}[keyof M];

/**
 * Removes keys from M that are sub-fields of a `nested` parent.
 * For example, if `variants` is a nested field, `variants.color` is excluded.
 * Used to prevent root-level query methods from accepting nested descendants —
 * those fields must be queried inside a `.nested()` callback instead.
 */
type ExcludeNestedDescendants<M extends Record<string, FieldTypeString>> = {
  [K in keyof M as K extends `${FieldsOfType<M, 'nested'> & string}.${string}` ? never : K]: M[K];
};

export type TextFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  ExcludeNestedDescendants<M>,
  'text' | 'match_only_text' | 'search_as_you_type'
>;

export type KeywordFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  ExcludeNestedDescendants<M>,
  'keyword' | 'constant_keyword' | 'wildcard'
>;

export type NumericFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  ExcludeNestedDescendants<M>,
  'long' | 'integer' | 'short' | 'byte' | 'double' | 'float' | 'half_float' | 'scaled_float' | 'unsigned_long'
>;

export type DateFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  ExcludeNestedDescendants<M>,
  'date' | 'date_nanos'
>;

export type BooleanFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  ExcludeNestedDescendants<M>,
  'boolean'
>;

export type GeoPointFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  ExcludeNestedDescendants<M>,
  'geo_point'
>;

export type GeoShapeFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  ExcludeNestedDescendants<M>,
  'geo_shape'
>;

/**
 * Projection covering `rank_feature` and `rank_features` fields — valid targets for
 * the `rank_feature` query and `distance_feature` (when using the rank_feature origin).
 */
export type RankFeatureFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  ExcludeNestedDescendants<M>,
  'rank_feature' | 'rank_features'
>;

/**
 * Umbrella projection covering all vector-shaped field types (dense + sparse).
 * Use the narrower `DenseVectorFields<M>` or `SparseVectorFields<M>` when a
 * specific vector variant is required (e.g. `.knn()` dense-only, `.sparseVector()` sparse-only).
 */
export type VectorFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  ExcludeNestedDescendants<M>,
  'dense_vector' | 'sparse_vector'
>;

/**
 * Fields valid as the target of a `.knn()` query — dense vector fields only.
 * Kept as a dedicated alias so the `.knn()` constraint is explicit and so the broader
 * `VectorFields<M>` umbrella can grow without loosening `.knn()`.
 */
export type DenseVectorFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  ExcludeNestedDescendants<M>,
  'dense_vector'
>;

/**
 * Fields valid as the target of a `.sparseVector()` query — sparse vector fields only.
 * Used by ELSER and other learned-sparse retrieval models.
 */
export type SparseVectorFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  ExcludeNestedDescendants<M>,
  'sparse_vector'
>;

/**
 * Fields valid as the target of a completion suggester.
 */
export type CompletionFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  ExcludeNestedDescendants<M>,
  'completion'
>;

export type IpFields<M extends Record<string, FieldTypeString>> = FieldsOfType<ExcludeNestedDescendants<M>, 'ip'>;

/**
 * Fields valid for sorting in Elasticsearch.
 * Excludes `object`, `nested`, `dense_vector`, `binary`, `geo_shape`, `geo_point`, and other non-sortable types.
 * Note: `geo_point` fields require the special `_geo_distance` sort syntax, not a plain field sort.
 */
export type SortableFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  ExcludeNestedDescendants<M>,
  | 'keyword'
  | 'constant_keyword'
  | 'long'
  | 'integer'
  | 'short'
  | 'byte'
  | 'double'
  | 'float'
  | 'half_float'
  | 'scaled_float'
  | 'date'
  | 'boolean'
  | 'ip'
>;

/**
 * Fields valid for field collapsing in Elasticsearch.
 * Collapse requires a keyword or numeric field.
 */
export type CollapsibleFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  ExcludeNestedDescendants<M>,
  | 'keyword'
  | 'constant_keyword'
  | 'long'
  | 'integer'
  | 'short'
  | 'byte'
  | 'double'
  | 'float'
  | 'half_float'
  | 'scaled_float'
>;

/**
 * Fields valid for highlighting in Elasticsearch.
 * Highlighting applies to text-like and keyword fields only.
 */
export type HighlightableFields<M extends Record<string, FieldTypeString>> = FieldsOfType<
  ExcludeNestedDescendants<M>,
  'text' | 'match_only_text' | 'search_as_you_type' | 'keyword' | 'constant_keyword' | 'wildcard'
>;

/** Maps a single FieldTypeString to its TypeScript value type. Used by Val<M,K> in query constraints. */
export type FieldValueType<T extends FieldTypeString> = T extends keyof ESTypeToTS ? ESTypeToTS[T] : unknown;

// ---------------------------------------------------------------------------
// Nested query helpers — for typed .nested() path and inner clause builder
// ---------------------------------------------------------------------------

/**
 * Extracts field names from M that have type `'nested'`.
 * Used to constrain the `path` argument of `.nested()` to valid nested field names.
 */
export type NestedPathFields<M extends Record<string, FieldTypeString>> = FieldsOfType<M, 'nested'>;

/**
 * Given a parent field path (e.g. `'tags'`), extracts the sub-fields of that path
 * from the flat expanded M map. Keys like `'tags.label'` become `'label'` in the result.
 *
 * Used to provide a typed `ClauseBuilder` for the inner callback of `.nested()`.
 */
export type SubFieldsOf<M extends Record<string, FieldTypeString>, Path extends string> = {
  [K in keyof M as K extends `${Path}.${infer Rest}` ? Rest : never]: M[K] & FieldTypeString;
};
