/**
 * Multi-Search API builder
 * Enables batching multiple search requests in a single API call
 */

import type { FieldTypeString } from './index-management.types.js';
import type { MappingsSchema } from './mapping.types.js';
import { MSearchBuilder, MSearchRequest } from './multi-search.types.js';

/**
 * Creates a multi-search builder
 * @returns MSearchBuilder instance
 */
export const createMSearchBuilder = <M extends Record<string, FieldTypeString>>(
  searches: MSearchRequest<M>[] = []
): MSearchBuilder<M> => ({
  add: (request) => {
    return createMSearchBuilder<M>([...searches, request]);
  },

  addQuery: (body, header = {}) => {
    return createMSearchBuilder<M>([...searches, { header, body }]);
  },

  // eslint-disable-next-line functional/functional-parameters
  build: () => {
    return `${searches
      .map(({ header, body }) => {
        const headerLine = JSON.stringify(header || {});
        const bodyLine = JSON.stringify(body);
        return `${headerLine}\n${bodyLine}`;
      })
      .join('\n')}\n`;
  },

  // eslint-disable-next-line functional/functional-parameters
  buildArray: () => {
    return searches.flatMap(({ header, body }) => [header || {}, body]);
  }
});

/**
 * Create a new multi-search builder
 * @example
 * const ms = msearch(productMappings)
 *   .addQuery(query1.build(), { index: 'products' })
 *   .addQuery(query2.build(), { index: 'products' })
 *   .build();
 */
export const msearch = <M extends Record<string, FieldTypeString>>(_schema: MappingsSchema<M>) =>
  createMSearchBuilder<M>();
