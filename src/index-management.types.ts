/**
 * Type definitions for Index Management
 * Partially derived from official @elastic/elasticsearch types.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/indices.html
 */

import type {
  IndicesIndexSettings,
  IndicesAlias
} from '@elastic/elasticsearch/lib/api/types';
import type { MappingsSchema } from './mapping.types.js';

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
};

/**
 * Index mappings configuration.
 */
export type IndexMappings = {
  properties: Record<string, FieldMapping>;
  dynamic?: boolean | 'strict' | 'runtime';
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
export type CreateIndexOptions = {
  mappings?: IndexMappings;
  settings?: IndexSettings;
  aliases?: Record<string, IndicesAlias>;
};

/**
 * Index builder interface
 */
export type IndexBuilder = {
  mappings: (
    schemaOrFields:
      | MappingsSchema<Record<string, FieldTypeString>>
      | Record<string, FieldMapping>
  ) => IndexBuilder;
  settings: (settings: IndexSettings) => IndexBuilder;
  alias: (name: string, options?: IndicesAlias) => IndexBuilder;
  build: () => CreateIndexOptions;
};
