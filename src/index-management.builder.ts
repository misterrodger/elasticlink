/**
 * Index Management builder
 * Create and configure Elasticsearch indices
 */

import type {
  IndexBuilder,
  CreateIndexOptions,
  MappingsInput,
  IndexMappings,
  FieldMappingInput,
  FieldMapping
} from './index-management.types.js';
import { resolveField } from './field.helpers.js';

/** Resolves MappingsInput<T> to the ES-compatible IndexMappings<T> */
const resolveMappings = <T>(input: MappingsInput<T>): IndexMappings<T> => {
  const { dynamic, dynamic_templates, ...fields } = input;

  const properties = {} as { [K in keyof T]?: FieldMapping };
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      (properties as Record<string, FieldMapping>)[key] = resolveField(
        value as FieldMappingInput
      );
    }
  }

  const mappings: IndexMappings<T> = { properties };
  if (dynamic !== undefined) mappings.dynamic = dynamic;
  if (dynamic_templates !== undefined)
    mappings.dynamic_templates = dynamic_templates;

  return mappings;
};

/**
 * Creates an index builder
 * @returns IndexBuilder instance
 */
export const createIndexBuilder = <T>(
  state: CreateIndexOptions<T> = {}
): IndexBuilder<T> => ({
  mappings: (mappings) => {
    return createIndexBuilder<T>({
      ...state,
      mappings: resolveMappings(mappings)
    });
  },

  settings: (settings) => {
    return createIndexBuilder<T>({ ...state, settings });
  },

  alias: (name, options = {}) => {
    const aliases = state.aliases || {};
    return createIndexBuilder<T>({
      ...state,
      aliases: { ...aliases, [name]: options }
    });
  },

  build: () => state
});

/**
 * Create a new index builder
 * @example
 * const indexConfig = indexBuilder<Product>()
 *   .mappings({
 *     name: text({ analyzer: 'standard' }),
 *     price: 'float',
 *     category: 'keyword',
 *   })
 *   .settings({
 *     number_of_shards: 1,
 *     number_of_replicas: 1
 *   })
 *   .alias('products_alias')
 *   .build();
 */
export const indexBuilder = <T>() => createIndexBuilder<T>();
