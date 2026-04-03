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
  UnsignedLongFieldOptions,
  ScaledFloatFieldOptions,
  DateFieldOptions,
  DateNanosFieldOptions,
  IpRangeFieldOptions,
  NestedFieldOptions,
  BooleanFieldOptions,
  DenseVectorFieldOptions,
  RankFeatureFieldOptions,
  RankFeaturesFieldOptions,
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
  TokenCountFieldOptions,
  JoinFieldOptions,
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
  DateNanosFieldMapping,
  IpRangeFieldMapping,
  BooleanFieldMapping,
  BinaryFieldMapping,
  IpFieldMapping,
  DenseVectorFieldMapping,
  SparseVectorFieldMapping,
  RankFeatureFieldMapping,
  RankFeaturesFieldMapping,
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
  FlattenedFieldMapping,
  TokenCountFieldMapping,
  Murmur3FieldMapping,
  JoinFieldMapping
} from './field.types.js';

// Text & keyword
export const text = <MF extends Record<string, FieldMappingWithLiteralType>>(
  options?: TextFieldOptions<MF>
): TextFieldMapping & Readonly<{ _multiFields: MF }> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({ type: 'text', ...options }) as any;
export const keyword = <MF extends Record<string, FieldMappingWithLiteralType>>(
  options?: KeywordFieldOptions<MF>
): KeywordFieldMapping & Readonly<{ _multiFields: MF }> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({ type: 'keyword', ...options }) as any;

// Numeric
export const long = <MF extends Record<string, FieldMappingWithLiteralType>>(
  options?: NumericFieldOptions<MF>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): LongFieldMapping & Readonly<{ _multiFields: MF }> => ({ type: 'long', ...options }) as any;
export const integer = <MF extends Record<string, FieldMappingWithLiteralType>>(
  options?: NumericFieldOptions<MF>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): IntegerFieldMapping & Readonly<{ _multiFields: MF }> => ({ type: 'integer', ...options }) as any;
export const short = <MF extends Record<string, FieldMappingWithLiteralType>>(
  options?: NumericFieldOptions<MF>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ShortFieldMapping & Readonly<{ _multiFields: MF }> => ({ type: 'short', ...options }) as any;
export const byte = <MF extends Record<string, FieldMappingWithLiteralType>>(
  options?: NumericFieldOptions<MF>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ByteFieldMapping & Readonly<{ _multiFields: MF }> => ({ type: 'byte', ...options }) as any;
export const double = <MF extends Record<string, FieldMappingWithLiteralType>>(
  options?: NumericFieldOptions<MF>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): DoubleFieldMapping & Readonly<{ _multiFields: MF }> => ({ type: 'double', ...options }) as any;
export const float = <MF extends Record<string, FieldMappingWithLiteralType>>(
  options?: NumericFieldOptions<MF>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): FloatFieldMapping & Readonly<{ _multiFields: MF }> => ({ type: 'float', ...options }) as any;
export const halfFloat = <MF extends Record<string, FieldMappingWithLiteralType>>(
  options?: NumericFieldOptions<MF>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): HalfFloatFieldMapping & Readonly<{ _multiFields: MF }> => ({ type: 'half_float', ...options }) as any;
export const scaledFloat = <MF extends Record<string, FieldMappingWithLiteralType>>(
  options?: ScaledFloatFieldOptions<MF>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ScaledFloatFieldMapping & Readonly<{ _multiFields: MF }> => ({ type: 'scaled_float', ...options }) as any;

// Date & boolean
export const date = <MF extends Record<string, FieldMappingWithLiteralType>>(
  options?: DateFieldOptions<MF>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): DateFieldMapping & Readonly<{ _multiFields: MF }> => ({ type: 'date', ...options }) as any;

/**
 * Date field stored with nanosecond precision. Same API as `date()` but supports sub-millisecond timestamps.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/date_nanos.html
 */
export const dateNanos = <MF extends Record<string, FieldMappingWithLiteralType>>(
  options?: DateNanosFieldOptions<MF>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): DateNanosFieldMapping & Readonly<{ _multiFields: MF }> => ({ type: 'date_nanos', ...options }) as any;
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
 * const result = queryBuilder(schema)
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
 * Rank feature field — a single numeric feature used by the `rank_feature` query to boost relevance.
 * Use when each document has one named signal (e.g. `pagerank`, `popularity_score`).
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/rank-feature.html
 */
export const rankFeature = (options?: RankFeatureFieldOptions): RankFeatureFieldMapping => ({
  type: 'rank_feature',
  ...options
});

/**
 * Rank features field — a sparse map of numeric features used by the `rank_feature` query.
 * Use when each document has many named signals (e.g. topic scores).
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/rank-features.html
 */
export const rankFeatures = (options?: RankFeaturesFieldOptions): RankFeaturesFieldMapping => ({
  type: 'rank_features',
  ...options
});

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
export const unsignedLong = <MF extends Record<string, FieldMappingWithLiteralType>>(
  options?: UnsignedLongFieldOptions<MF>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): UnsignedLongFieldMapping & Readonly<{ _multiFields: MF }> => ({ type: 'unsigned_long', ...options }) as any;

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
 * queryBuilder(m).term('address.city', 'NYC').build();
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
 * queryBuilder(m).nested('tags', q => q.term('label', 'sale')).build();
 */
export function nested<F extends Record<string, FieldMappingWithLiteralType>>(
  fields: F,
  options?: NestedFieldOptions
): TypedNestedFieldMapping<F> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { type: 'nested', ...(options ?? {}), properties: fields } as any;
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
 * IP range field — stores a range of IPv4/IPv6 addresses.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/range.html
 */
export const ipRange = (options?: IpRangeFieldOptions): IpRangeFieldMapping => ({
  type: 'ip_range',
  ...options
});

/**
 * No-score text field — faster and uses less disk than `text()`.
 * Use when you only need filter/match but not relevance scoring (e.g., logs, simple field matches).
 */
export const matchOnlyText = <MF extends Record<string, FieldMappingWithLiteralType>>(
  options?: MatchOnlyTextFieldOptions<MF>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): MatchOnlyTextFieldMapping & Readonly<{ _multiFields: MF }> => ({ type: 'match_only_text', ...options }) as any;

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

/**
 * Token count field — stores the number of tokens produced by an analyzer.
 * Useful for enforcing minimum/maximum field lengths via queries or aggregations.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/token-count.html
 */
export const tokenCount = (options?: TokenCountFieldOptions): TokenCountFieldMapping => ({
  type: 'token_count',
  ...options
});

/**
 * Murmur3 hash field — computes and stores a murmur3 hash of field values at index time.
 * Requires the `mapper-murmur3` plugin.
 * @see https://www.elastic.co/guide/en/elasticsearch/plugins/current/mapper-murmur3.html
 */
// eslint-disable-next-line functional/functional-parameters
export const murmur3Hash = (): Murmur3FieldMapping => ({ type: 'murmur3' });

/**
 * Join field — defines parent/child relationships within a single index.
 * `relations` is required: maps parent names to one or more child names.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/parent-join.html
 *
 * @example
 * const m = mappings({
 *   title: text(),
 *   relation: join({ relations: { question: 'answer' } }),
 * });
 */
export const join = (options: JoinFieldOptions): JoinFieldMapping => ({
  type: 'join',
  ...options
});
