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

import type {
  TextFieldOptions,
  KeywordFieldOptions,
  NumericFieldOptions,
  ScaledFloatFieldOptions,
  DateFieldOptions,
  BooleanFieldOptions,
  DenseVectorFieldOptions,
  SemanticTextFieldOptions,
  ObjectFieldOptions,
  CompletionFieldOptions,
  GeoPointFieldOptions,
  GeoShapeFieldOptions,
  AliasFieldOptions,
  IpFieldOptions,
  RangeFieldOptions,
  MatchOnlyTextFieldOptions,
  SearchAsYouTypeFieldOptions,
  ConstantKeywordFieldOptions,
  WildcardFieldOptions,
  FlattenedFieldOptions,
  FieldMappingWithLiteralType,
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
  SparseVectorFieldMapping,
  SemanticTextFieldMapping,
  UnsignedLongFieldMapping,
  GeoPointFieldMapping,
  GeoShapeFieldMapping,
  CompletionFieldMapping,
  TypedNestedFieldMapping,
  TypedObjectFieldMapping,
  AliasFieldMapping,
  PercolatorFieldMapping,
  IntegerRangeFieldMapping,
  FloatRangeFieldMapping,
  LongRangeFieldMapping,
  DoubleRangeFieldMapping,
  DateRangeFieldMapping,
  MatchOnlyTextFieldMapping,
  SearchAsYouTypeFieldMapping,
  ConstantKeywordFieldMapping,
  WildcardFieldMapping,
  FlattenedFieldMapping
} from './field.types.js';

// Text & keyword
export const text = (options?: TextFieldOptions): TextFieldMapping => ({
  type: 'text',
  ...options
});
export const keyword = (options?: KeywordFieldOptions): KeywordFieldMapping => ({
  type: 'keyword',
  ...options
});

// Numeric
export const long = (options?: NumericFieldOptions): LongFieldMapping => ({
  type: 'long',
  ...options
});
export const integer = (options?: NumericFieldOptions): IntegerFieldMapping => ({
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
export const halfFloat = (options?: NumericFieldOptions): HalfFloatFieldMapping => ({
  type: 'half_float',
  ...options
});
export const scaledFloat = (options?: ScaledFloatFieldOptions): ScaledFloatFieldMapping => ({
  type: 'scaled_float',
  ...options
});

// Date & boolean
export const date = (options?: DateFieldOptions): DateFieldMapping => ({
  type: 'date',
  ...options
});
export const boolean = (options?: BooleanFieldOptions): BooleanFieldMapping => ({
  type: 'boolean',
  ...options
});

// Binary
// eslint-disable-next-line functional/functional-parameters
export const binary = (): BinaryFieldMapping => ({ type: 'binary' });

// IP
export const ip = (options?: IpFieldOptions): IpFieldMapping => ({
  type: 'ip',
  ...options
});

// Vector
export const denseVector = (options?: DenseVectorFieldOptions): DenseVectorFieldMapping => ({
  type: 'dense_vector',
  ...options
});

/**
 * Quantized dense vector field — wraps `denseVector()` with `int8_hnsw` index type.
 *
 * Quantizes float32 vectors to int8 at index time, saving ~75% memory.
 * Recommended for vectors with dims >= 384. Original float vectors are retained
 * in the index, enabling a two-phase search pattern:
 *
 * 1. Fast approximate search using quantized int8 vectors
 * 2. Precise rescore of top-k results using retained float vectors
 *
 * @example
 * // Index mapping
 * const schema = mappings({
 *   title: text(),
 *   embedding: quantizedDenseVector({ dims: 768, similarity: 'cosine' }),
 * }, {
 *   _source: { excludes: ['embedding'] },
 * });
 *
 * // Two-phase search: fast kNN + precise rescore
 * const result = query(schema)
 *   .knn('embedding', queryVector, { k: 100, num_candidates: 200 })
 *   .rescore(
 *     (q) => q.scriptScore(
 *       (inner) => inner.matchAll(),
 *       { source: "cosineSimilarity(params.v, 'embedding') + 1.0", params: { v: queryVector } }
 *     ),
 *     100
 *   )
 *   .build();
 */
export const quantizedDenseVector = (options?: DenseVectorFieldOptions): DenseVectorFieldMapping => ({
  type: 'dense_vector',
  ...options,
  index_options: { type: 'int8_hnsw', ...options?.index_options }
});

/**
 * Sparse vector field — stores token-weight pairs for sparse retrieval (e.g. ELSER/BM25-style models).
 * Complement to `denseVector()`. Query with the `sparse_vector` query.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/sparse-vector.html
 */
// eslint-disable-next-line functional/functional-parameters
export const sparseVector = (): SparseVectorFieldMapping => ({ type: 'sparse_vector' });

/**
 * Semantic text field (ES 9.x) — ML-powered text field for semantic and hybrid search.
 * Automatically generates and stores embeddings at index time using the configured inference endpoint.
 *
 * @example
 * const schema = mappings({
 *   title: text(),
 *   body: semanticText({ inference_id: 'my-elser-endpoint' }),
 * });
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/semantic-text.html
 */
export const semanticText = (options?: SemanticTextFieldOptions): SemanticTextFieldMapping => ({
  type: 'semantic_text',
  ...options
});

/**
 * Unsigned long field (ES 9.0+) — stores unsigned 64-bit integer values (0 to 2^64-1).
 * Use when values exceed the `long` range.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/number.html
 */
export const unsignedLong = (options?: NumericFieldOptions): UnsignedLongFieldMapping => ({
  type: 'unsigned_long',
  ...options
});

// Geo
export const geoPoint = (options?: GeoPointFieldOptions): GeoPointFieldMapping => ({
  type: 'geo_point',
  ...options
});
export const geoShape = (options?: GeoShapeFieldOptions): GeoShapeFieldMapping => ({
  type: 'geo_shape',
  ...options
});

// Completion
export const completion = (options?: CompletionFieldOptions): CompletionFieldMapping => ({
  type: 'completion',
  ...options
});

// Structured

/**
 * Object field — for JSON-like structured documents where sub-fields are queried with dot-notation.
 *
 * The most common way to model structured data (e.g. `{ address: { city, zip } }`).
 * Sub-fields are indexed inline within the parent document — no special query wrapper needed.
 * Query sub-fields directly using dot-notation: `.term('address.city', 'NYC')`.
 *
 * Use `nested()` instead when you have **arrays of objects** and need cross-field queries
 * within each element to be accurate (e.g. tags with both a label and weight).
 *
 * @example
 * const m = mappings({
 *   address: object({
 *     street: text(),
 *     city: keyword(),
 *     zip: keyword(),
 *   }),
 * });
 * query(m).term('address.city', 'NYC').build();
 */
export function object<F extends Record<string, FieldMappingWithLiteralType>>(
  fields: F,
  options?: ObjectFieldOptions
): TypedObjectFieldMapping<F> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { type: 'object', ...(options ?? {}), properties: fields } as any;
}

/**
 * Nested field — for **arrays of objects** where cross-field queries within each element must be accurate.
 *
 * Each nested object is stored as a separate hidden Elasticsearch document, preserving the
 * relationship between sub-fields within each element. Without `nested`, Elasticsearch flattens
 * array sub-fields and loses which values belong to the same element.
 *
 * Queries on nested fields **must** use the `.nested()` query builder method — direct dot-notation
 * queries will not find nested documents.
 *
 * Use `object()` instead for single structured objects (addresses, names, etc.) — it is simpler,
 * more efficient, and does not require a query wrapper.
 *
 * @example
 * const m = mappings({
 *   tags: nested({
 *     label: keyword(),
 *     weight: float(),
 *   }),
 * });
 * query(m).nested('tags', q => q.term('label', 'sale')).build();
 */
export function nested<F extends Record<string, FieldMappingWithLiteralType>>(fields: F): TypedNestedFieldMapping<F> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { type: 'nested', properties: fields } as any;
}

// Alias
export const alias = (options: AliasFieldOptions): AliasFieldMapping => ({
  type: 'alias',
  ...options
});

// Percolator
// eslint-disable-next-line functional/functional-parameters
export const percolator = (): PercolatorFieldMapping => ({
  type: 'percolator'
});

// Range types
export const integerRange = (options?: RangeFieldOptions): IntegerRangeFieldMapping => ({
  type: 'integer_range',
  ...options
});
export const floatRange = (options?: RangeFieldOptions): FloatRangeFieldMapping => ({
  type: 'float_range',
  ...options
});
export const longRange = (options?: RangeFieldOptions): LongRangeFieldMapping => ({
  type: 'long_range',
  ...options
});
export const doubleRange = (options?: RangeFieldOptions): DoubleRangeFieldMapping => ({
  type: 'double_range',
  ...options
});
export const dateRange = (options?: RangeFieldOptions): DateRangeFieldMapping => ({
  type: 'date_range',
  ...options
});

/**
 * No-score text field — faster and uses less disk than `text()`.
 * Use when you only need filter/match but not relevance scoring (e.g., logs, simple field matches).
 */
export const matchOnlyText = (options?: MatchOnlyTextFieldOptions): MatchOnlyTextFieldMapping => ({
  type: 'match_only_text',
  ...options
});

/**
 * Autocomplete / typeahead field. Creates sub-fields for edge n-gram matching
 * out of the box. Query with `multi_match` targeting the generated sub-fields.
 */
export const searchAsYouType = (options?: SearchAsYouTypeFieldOptions): SearchAsYouTypeFieldMapping => ({
  type: 'search_as_you_type',
  ...options
});

/**
 * Field where every document has the same value. Useful for multi-index queries
 * to identify the index type (e.g., `constantKeyword({ value: 'product' })`).
 */
export const constantKeyword = (options?: ConstantKeywordFieldOptions): ConstantKeywordFieldMapping => ({
  type: 'constant_keyword',
  ...options
});

/**
 * Optimized for grep-like wildcard/regexp queries on high-cardinality or large fields.
 * Use instead of `keyword()` when leading wildcards (`*foo`) are needed.
 */
export const wildcardField = (options?: WildcardFieldOptions): WildcardFieldMapping => ({
  type: 'wildcard',
  ...options
});

/**
 * Flattens complex/dynamic objects into a single field. Faster than `nested()`,
 * but only supports keyword-level queries on inner values.
 */
export const flattened = (options?: FlattenedFieldOptions): FlattenedFieldMapping => ({
  type: 'flattened',
  ...options
});
