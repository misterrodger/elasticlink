/**
 * Index Management builder
 * Create and configure Elasticsearch indices
 */

import type {
  FieldMapping,
  FieldTypeString,
  IndexBuilder,
  CreateIndexOptions
} from './index-management.types.js';
import type { MappingsSchema } from './mapping.types.js';

const isMappingsSchema = (
  input:
    | MappingsSchema<Record<string, FieldTypeString>>
    | Record<string, FieldMapping>
): input is MappingsSchema<Record<string, FieldTypeString>> =>
  '_fieldTypes' in input;

/**
 * Creates an index builder
 * @returns IndexBuilder instance
 */
export const createIndexBuilder = (
  state: CreateIndexOptions = {}
): IndexBuilder => ({
  mappings: (schemaOrFields) => {
    const properties = isMappingsSchema(schemaOrFields)
      ? schemaOrFields.properties
      : schemaOrFields;
    return createIndexBuilder({
      ...state,
      mappings: { properties }
    });
  },

  settings: (settings) => createIndexBuilder({ ...state, settings }),

  alias: (name, options = {}) => {
    const aliases = state.aliases || {};
    return createIndexBuilder({
      ...state,
      aliases: { ...aliases, [name]: options }
    });
  },

  build: () => state
});

/**
 * Create a new index builder
 * @example
 * const indexConfig = indexBuilder()
 *   .mappings(productMappings)
 *   .settings({ number_of_shards: 1, number_of_replicas: 1 })
 *   .alias('products_alias')
 *   .build();
 */
export const indexBuilder = () => createIndexBuilder();
