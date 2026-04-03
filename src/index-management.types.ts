/**
 * Type definitions for Index Management
 * Partially derived from official @elastic/elasticsearch types.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/indices.html
 */

import type {
  IndicesIndexSettings,
  IndicesAlias,
  IndicesIndexSettingsAnalysis,
  AnalysisAnalyzer,
  AnalysisTokenizer,
  AnalysisTokenFilter,
  AnalysisCharFilter,
  AnalysisNormalizer,
  MappingDynamicTemplate
} from '@elastic/elasticsearch/lib/api/types';
import type { MappingsSchema, MappingOptions } from './mapping.types.js';

/**
 * All supported Elasticsearch field type strings.
 */
export type FieldTypeString =
  | 'text'
  | 'match_only_text'
  | 'keyword'
  | 'constant_keyword'
  | 'wildcard'
  | 'long'
  | 'integer'
  | 'short'
  | 'byte'
  | 'double'
  | 'float'
  | 'half_float'
  | 'scaled_float'
  | 'date'
  | 'date_nanos'
  | 'boolean'
  | 'binary'
  | 'integer_range'
  | 'float_range'
  | 'long_range'
  | 'double_range'
  | 'date_range'
  | 'ip_range'
  | 'ip'
  | 'alias'
  | 'object'
  | 'nested'
  | 'flattened'
  | 'geo_point'
  | 'geo_shape'
  | 'completion'
  | 'search_as_you_type'
  | 'dense_vector'
  | 'sparse_vector'
  | 'rank_feature'
  | 'rank_features'
  | 'semantic_text'
  | 'unsigned_long'
  | 'percolator'
  | 'token_count'
  | 'murmur3'
  | 'join';

/**
 * Field mapping definition.
 */
export type FieldMapping = {
  type: FieldTypeString;
  fields?: Record<string, FieldMapping>;
  analyzer?: string;
  search_analyzer?: string;
  boost?: number;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  similarity?: string;
  dims?: number;
  // Bucket 3: the Elastic union spans text/dense_vector/knn variants; loose on purpose.
  // Narrowing is deferred (see ROADMAP.md — FieldMapping.index_options narrowing).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  index_options?: any;
  scaling_factor?: number;
  properties?: Record<string, FieldMapping>;
  normalizer?: string;
  format?: string;
  coerce?: boolean;
  enabled?: boolean;
  element_type?: string;
  path?: string;
  max_input_length?: number;
  preserve_separators?: boolean;
  preserve_position_increments?: boolean;
  orientation?: string;
  copy_to?: string | string[];
  index_prefixes?: { min_chars?: number; max_chars?: number };
  index_phrases?: boolean;
  ignore_malformed?: boolean;
  null_value?: string | number | boolean | { lat: number; lon: number };
  eager_global_ordinals?: boolean;
  term_vector?: string;
  ignore_above?: number;
  max_shingle_size?: number;
  value?: string;
  depth_limit?: number;
  inference_id?: string;
  search_inference_id?: string;
};

/**
 * _source field configuration for index mappings.
 */
export type SourceConfig = {
  enabled?: boolean;
  includes?: string[];
  excludes?: string[];
};

/**
 * Index mappings configuration.
 */
export type IndexMappings = {
  properties: Record<string, FieldMapping>;
  dynamic?: boolean | 'strict' | 'runtime';
  dynamic_templates?: Partial<Record<string, MappingDynamicTemplate>>[];
  _source?: SourceConfig;
  _meta?: Record<string, unknown>;
};

/**
 * Index settings configuration — re-exported from official @elastic/elasticsearch types
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules.html
 */
export type IndexSettings = IndicesIndexSettings;

/**
 * Create index options
 */
export type CreateIndexOptions = {
  mappings?: IndexMappings;
  settings?: IndexSettings;
  aliases?: Record<string, IndicesAlias>;
};

/**
 * Custom analyzer definition — passthrough to `AnalysisAnalyzer` from `@elastic/elasticsearch`.
 * Covers every built-in analyzer (standard, pattern, keyword, language analyzers, ICU, Kuromoji, etc.).
 */
export type AnalysisAnalyzerConfig = AnalysisAnalyzer;

/**
 * Tokenizer passthrough — accepts either a built-in tokenizer name string or a
 * full `AnalysisTokenizerDefinition`.
 */
export type AnalysisTokenizerConfig = AnalysisTokenizer;

/**
 * Token filter passthrough — accepts either a built-in token filter name string or a
 * full `AnalysisTokenFilterDefinition`.
 */
export type AnalysisTokenFilterConfig = AnalysisTokenFilter;

/**
 * Char filter passthrough — accepts either a built-in char filter name string or a
 * full `AnalysisCharFilterDefinition`.
 */
export type AnalysisCharFilterConfig = AnalysisCharFilter;

/**
 * Normalizer passthrough.
 */
export type AnalysisNormalizerConfig = AnalysisNormalizer;

/**
 * Analysis settings for an index — configures custom analyzers, tokenizers, token filters, and char filters.
 * Passes through `IndicesIndexSettingsAnalysis` from `@elastic/elasticsearch`, unlocking every
 * built-in and plugin analyzer/tokenizer/filter for free as the Elastic types evolve.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis.html
 */
export type AnalysisConfig = IndicesIndexSettingsAnalysis;

/**
 * Index builder interface.
 *
 * The optional generic `M` carries the field-type map of the attached mapping schema,
 * enabling other builders (or downstream type helpers) to reference the same field
 * constraints that were used to build the index.
 */
export type IndexBuilder<M extends Record<string, FieldTypeString> = Record<string, FieldTypeString>> = {
  mappings: <NewM extends Record<string, FieldTypeString>>(
    schemaOrFields: MappingsSchema<NewM> | Record<string, FieldMapping>,
    options?: MappingOptions
  ) => IndexBuilder<NewM>;
  settings: (settings: IndexSettings) => IndexBuilder<M>;
  /** Configure custom analyzers, tokenizers, token filters, and char filters for this index. */
  analysis: (config: AnalysisConfig) => IndexBuilder<M>;
  alias: (name: string, options?: IndicesAlias) => IndexBuilder<M>;
  build: () => CreateIndexOptions;
};
