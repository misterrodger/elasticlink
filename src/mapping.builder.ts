/**
 * Mappings builder — creates a MappingsSchema artifact from field helper functions.
 * The schema carries field-type info at compile time and ES-compatible properties at runtime.
 *
 * @example
 * import { mappings, text, keyword, float } from 'elasticlink';
 *
 * const productMappings = mappings({
 *   name: text({ analyzer: 'standard' }),
 *   category: keyword(),
 *   price: float(),
 * });
 */

import type {
  FieldMapping,
  FieldTypeString
} from './index-management.types.js';
import type { MappingsSchema } from './mapping.types.js';

type FieldMappingWithLiteralType = FieldMapping & { type: FieldTypeString };

type ExtractFieldTypes<F extends Record<string, FieldMappingWithLiteralType>> =
  {
    [K in keyof F]: F[K]['type'];
  };

export const mappings = <F extends Record<string, FieldMappingWithLiteralType>>(
  fields: F
): MappingsSchema<ExtractFieldTypes<F>> => {
  const properties: Record<string, FieldMapping> = {};
  for (const key of Object.keys(fields)) {
    properties[key] = fields[key];
  }
  return {
    _fieldTypes: undefined as unknown as ExtractFieldTypes<F>,
    properties
  };
};
