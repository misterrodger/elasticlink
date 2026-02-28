/**
 * Index Management builder
 * Create and configure Elasticsearch indices
 */

import type { FieldMapping, FieldTypeString, IndexBuilder, CreateIndexOptions } from './index-management.types.js';
import type { MappingsSchema, MappingOptions } from './mapping.types.js';

const isMappingsSchema = (
  input: MappingsSchema<Record<string, FieldTypeString>> | Record<string, FieldMapping>
): input is MappingsSchema<Record<string, FieldTypeString>> => '_fieldTypes' in input;

/**
 * Creates an index builder
 * @returns IndexBuilder instance
 */
export const createIndexBuilder = (state: CreateIndexOptions = {}): IndexBuilder => ({
  mappings: (schemaOrFields, inlineOptions) => {
    const rawProperties = isMappingsSchema(schemaOrFields) ? schemaOrFields.properties : schemaOrFields;
    const properties = Object.fromEntries(Object.entries(rawProperties).filter(([, v]) => v !== undefined));
    const schemaOptions = isMappingsSchema(schemaOrFields) ? schemaOrFields._mappingOptions : undefined;
    const mappingOptions: MappingOptions = {
      dynamic: 'strict',
      ...schemaOptions,
      ...inlineOptions
    };
    return createIndexBuilder({
      ...state,
      mappings: {
        properties,
        ...(mappingOptions.dynamic !== undefined && { dynamic: mappingOptions.dynamic }),
        ...(mappingOptions._source !== undefined && { _source: mappingOptions._source }),
        ...(mappingOptions._meta && { _meta: mappingOptions._meta })
      } as typeof state.mappings
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

  // eslint-disable-next-line functional/functional-parameters
  build: () => state
});

/**
 * Create a new index builder for Elasticsearch index configuration.
 *
 * Typical lifecycle:
 * 1. **Create index:** `indexBuilder().mappings(schema).settings(productionSearchSettings()).build()`
 * 2. **Bulk ingest:** Apply `fastIngestSettings()` via ES `_settings` API → bulk index →
 *    apply `productionSearchSettings()` → `POST /index/_refresh`
 * 3. **Normal operations:** Query, update individual docs via `_update` API
 * 4. **Migration with mapping changes:** Create new index with new mappings → `POST _reindex`
 *    from old → atomically swap alias via `POST _aliases` → delete old index
 *
 * After bulk loading, remember to refresh the index with `POST /index/_refresh`
 * to make all documents searchable.
 *
 * @example
 * const indexConfig = indexBuilder()
 *   .mappings(productMappings)
 *   .settings(productionSearchSettings())
 *   .alias('products')
 *   .build();
 */
// eslint-disable-next-line functional/functional-parameters
export const indexBuilder = () => createIndexBuilder();
