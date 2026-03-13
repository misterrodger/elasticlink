/**
 * Type definitions for Index Management
 * Partially derived from official @elastic/elasticsearch types.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/indices.html
 */

import type { IndicesIndexSettings, IndicesAlias } from '@elastic/elasticsearch/lib/api/types';
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
  | 'boolean'
  | 'binary'
  | 'integer_range'
  | 'float_range'
  | 'long_range'
  | 'double_range'
  | 'date_range'
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
  | 'semantic_text'
  | 'unsigned_long'
  | 'percolator';

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
  null_value?: string | number | boolean;
  eager_global_ordinals?: boolean;
  term_vector?: string;
  ignore_above?: number;
  max_shingle_size?: number;
  value?: string;
  depth_limit?: number;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dynamic_templates?: any[];
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
 * Custom analyzer definition for index analysis settings.
 */
export type AnalysisAnalyzerConfig = {
  type?: string;
  tokenizer?: string;
  filter?: string[];
  char_filter?: string[];
  [key: string]: unknown;
};

/**
 * Token filter, char filter, and tokenizer configuration — open record to support all ES built-in and plugin types.
 */
export type AnalysisComponentConfig = { type: string; [key: string]: unknown };

/**
 * Analysis settings for an index — configures custom analyzers, tokenizers, token filters, and char filters.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis.html
 */
export type AnalysisConfig = {
  analyzer?: Record<string, AnalysisAnalyzerConfig>;
  tokenizer?: Record<string, AnalysisComponentConfig>;
  filter?: Record<string, AnalysisComponentConfig>;
  char_filter?: Record<string, AnalysisComponentConfig>;
};

/**
 * Index builder interface
 */
export type IndexBuilder = {
  mappings: (
    schemaOrFields: MappingsSchema<Record<string, FieldTypeString>> | Record<string, FieldMapping>,
    options?: MappingOptions
  ) => IndexBuilder;
  settings: (settings: IndexSettings) => IndexBuilder;
  /** Configure custom analyzers, tokenizers, token filters, and char filters for this index. */
  analysis: (config: AnalysisConfig) => IndexBuilder;
  alias: (name: string, options?: IndicesAlias) => IndexBuilder;
  build: () => CreateIndexOptions;
};
