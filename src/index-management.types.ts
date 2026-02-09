/**
 * Type definitions for Index Management
 * Partially derived from official @elastic/elasticsearch types.
 * FieldMapping and IndexMappings use custom types for ergonomic builder API.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/indices.html
 */

import type {
  IndicesIndexSettings,
  IndicesAlias
} from '@elastic/elasticsearch/lib/api/types';

/**
 * All supported Elasticsearch field type strings.
 */
export type FieldTypeString =
  | 'text'
  | 'keyword'
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
  | 'geo_point'
  | 'geo_shape'
  | 'completion'
  | 'dense_vector'
  | 'percolator';

/**
 * Field mapping definition.
 * Uses custom type rather than official MappingProperty (48+ member discriminated union)
 * for a simpler, more ergonomic builder API.
 */
export type FieldMapping = {
  type: FieldTypeString;
  /** Multi-fields for different analyzers */
  fields?: Record<string, FieldMapping>;
  /** Text analyzer */
  analyzer?: string;
  /** Search-time analyzer */
  search_analyzer?: string;
  /** Field boost */
  boost?: number;
  /** Whether to index this field */
  index?: boolean;
  /** Whether to store this field */
  store?: boolean;
  /** Whether to use doc values */
  doc_values?: boolean;
  /** Similarity algorithm */
  similarity?: string;
  /** Dense vector dimensions */
  dims?: number;
  /** Dense vector index options */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  index_options?: any;
  /** Scaling factor for scaled_float type */
  scaling_factor?: number;
  /** Nested properties */
  properties?: Record<string, FieldMapping>;
  /** Normalizer for keyword fields */
  normalizer?: string;
  /** Date format */
  format?: string;
  /** Coerce numeric values */
  coerce?: boolean;
  /** Enable/disable the field */
  enabled?: boolean;
  /** Dense vector element type */
  element_type?: string;
  /** Alias field path */
  path?: string;
  /** Max input length for completion fields */
  max_input_length?: number;
  /** Preserve separators for completion fields */
  preserve_separators?: boolean;
  /** Preserve position increments for completion fields */
  preserve_position_increments?: boolean;
  /** Orientation for geo_shape fields */
  orientation?: string;
};

/**
 * A single field mapping input: a full FieldMapping object or a shorthand type string.
 */
export type FieldMappingInput = FieldMapping | FieldTypeString;

/**
 * Simplified mappings input for the builder.
 * Fields are defined at the top level (no `properties` wrapper needed).
 * Each field can be a FieldMapping object, a shorthand string, or the result of a helper function.
 */
export type MappingsInput<T> = {
  [K in keyof T]?: FieldMappingInput;
} & {
  /** Dynamic mapping behavior */
  dynamic?: boolean | 'strict' | 'runtime';
  /** Dynamic templates */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dynamic_templates?: any[];
};

/**
 * Index mappings configuration.
 * Uses generic type constraint for type-safe property names.
 */
export type IndexMappings<T> = {
  /** Field mappings */
  properties: {
    [K in keyof T]?: FieldMapping;
  };
  /** Dynamic mapping behavior */
  dynamic?: boolean | 'strict' | 'runtime';
  /** Dynamic templates */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dynamic_templates?: any[];
};

/**
 * Index settings configuration — re-exported from official @elastic/elasticsearch types
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules.html
 */
export type IndexSettings = IndicesIndexSettings;

/**
 * Create index options
 */
export type CreateIndexOptions<T> = {
  /** Index mappings */
  mappings?: IndexMappings<T>;
  /** Index settings */
  settings?: IndexSettings;
  /** Index aliases */
  aliases?: Record<string, IndicesAlias>;
};

/**
 * Index builder interface
 */
export type IndexBuilder<T> = {
  /** Configure index mappings */
  mappings: (mappings: MappingsInput<T>) => IndexBuilder<T>;
  /** Configure index settings */
  settings: (settings: IndexSettings) => IndexBuilder<T>;
  /** Add an alias */
  alias: (name: string, options?: IndicesAlias) => IndexBuilder<T>;
  /** Build the index configuration */
  build: () => CreateIndexOptions<T>;
};
