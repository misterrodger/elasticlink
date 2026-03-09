/**
 * Mappings builder — creates a MappingsSchema artifact from field helper functions.
 * The schema carries field-type info at compile time and ES-compatible properties at runtime.
 *
 * Defaults to `dynamic: 'strict'` to prevent unmapped fields from being silently
 * indexed. Override with `mappings(fields, { dynamic: true })` if needed.
 *
 * @example
 * import { mappings, text, keyword, float, denseVector } from 'elasticlink';
 *
 * const productMappings = mappings({
 *   name: text({ analyzer: 'standard' }),
 *   category: keyword(),
 *   price: float(),
 * });
 * // dynamic: 'strict' by default — unknown fields cause an indexing error
 *
 * @example
 * // Exclude dense_vector fields from _source to reduce response size
 * const searchMappings = mappings({
 *   title: text(),
 *   embedding: denseVector({ dims: 768 }),
 * }, {
 *   _source: { excludes: ['embedding'] },
 * });
 */

import type { FieldMapping } from './index-management.types.js';
import type { MappingOptions, MappingsSchema } from './mapping.types.js';
import type { FieldMappingWithLiteralType } from './field.types.js';

type UnionToIntersection<U> = (U extends unknown ? (x: U) => never : never) extends (x: infer I) => never ? I : never;

type FlattenSubFields<
  Prefix extends string,
  F extends Record<string, FieldMappingWithLiteralType>
> = UnionToIntersection<
  {
    [K in keyof F & string]: { [Key in `${Prefix}.${K}`]: F[K]['type'] } & (F[K] extends {
      _subFields: infer Sub extends Record<string, FieldMappingWithLiteralType>;
    }
      ? FlattenSubFields<`${Prefix}.${K}`, Sub>
      : Record<never, never>);
  }[keyof F & string]
>;

type ExtractFieldTypes<F extends Record<string, FieldMappingWithLiteralType>> = {
  [K in keyof F]: F[K]['type'];
} & UnionToIntersection<
  {
    [K in keyof F & string]: F[K] extends {
      _subFields: infer Sub extends Record<string, FieldMappingWithLiteralType>;
    }
      ? FlattenSubFields<K, Sub>
      : Record<never, never>;
  }[keyof F & string]
>;

export const mappings = <F extends Record<string, FieldMappingWithLiteralType>>(
  fields: F,
  options?: MappingOptions
): MappingsSchema<ExtractFieldTypes<F>, F> => {
  const properties: Record<string, FieldMapping> = { ...fields };

  const mappingOptions: MappingOptions = {
    dynamic: 'strict',
    ...options
  };

  return {
    _fieldTypes: undefined as unknown as ExtractFieldTypes<F>,
    _fields: undefined as unknown as F,
    properties,
    _mappingOptions: mappingOptions
  };
};
