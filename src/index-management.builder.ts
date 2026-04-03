/**
 * Index Management builder
 * Create and configure Elasticsearch indices
 */

import type {
  FieldMapping,
  FieldTypeString,
  IndexBuilder,
  CreateIndexOptions,
  AnalysisConfig,
  IndexSettings
} from './index-management.types.js';
import type { MappingsSchema, MappingOptions } from './mapping.types.js';

const isMappingsSchema = (
  input: MappingsSchema<Record<string, FieldTypeString>> | Record<string, FieldMapping>
): input is MappingsSchema<Record<string, FieldTypeString>> => '_fieldTypes' in input;

/**
 * Creates an index builder.
 *
 * The optional generic `M` carries the field-type map from any mapping schema attached
 * via `.mappings(schema)`. `.mappings()` rebinds the generic to the incoming schema's
 * field-type map, so callers typically rely on inference rather than specifying `M` directly.
 *
 * @returns IndexBuilder instance
 */
export const createIndexBuilder = <M extends Record<string, FieldTypeString> = Record<string, FieldTypeString>>(
  state: CreateIndexOptions = {}
): IndexBuilder<M> => ({
  mappings: <NewM extends Record<string, FieldTypeString>>(
    schemaOrFields: MappingsSchema<NewM> | Record<string, FieldMapping>,
    inlineOptions?: MappingOptions
  ): IndexBuilder<NewM> => {
    const rawProperties = isMappingsSchema(schemaOrFields) ? schemaOrFields.properties : schemaOrFields;
    const properties = Object.fromEntries(Object.entries(rawProperties).filter(([, v]) => v !== undefined));
    const schemaOptions = isMappingsSchema(schemaOrFields) ? schemaOrFields._mappingOptions : undefined;
    const mappingOptions: MappingOptions = {
      dynamic: 'strict',
      ...schemaOptions,
      ...inlineOptions
    };
    return createIndexBuilder<NewM>({
      ...state,
      mappings: {
        properties,
        ...(mappingOptions.dynamic !== undefined && { dynamic: mappingOptions.dynamic }),
        ...(mappingOptions._source !== undefined && { _source: mappingOptions._source }),
        ...(mappingOptions._meta && { _meta: mappingOptions._meta })
      } as typeof state.mappings
    });
  },

  settings: (settings) => createIndexBuilder<M>({ ...state, settings }),

  analysis: (config: AnalysisConfig) =>
    createIndexBuilder<M>({ ...state, settings: { ...state.settings, analysis: config } as IndexSettings }),

  alias: (name, options = {}) => {
    const aliases = state.aliases || {};
    return createIndexBuilder<M>({
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
export const indexBuilder = (): IndexBuilder => createIndexBuilder();
