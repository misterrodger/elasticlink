/**
 * Multi-Search API builder
 * Enables batching multiple search requests in a single API call
 */

import { MSearchBuilder, MSearchRequest } from './multi-search.types.js';

/**
 * Creates a multi-search builder
 * @returns MSearchBuilder instance
 */
export const createMSearchBuilder = <T>(
  searches: MSearchRequest<T>[] = []
): MSearchBuilder<T> => ({
  add: (request) => {
    return createMSearchBuilder<T>([...searches, request]);
  },

  addQuery: (body, header = {}) => {
    return createMSearchBuilder<T>([...searches, { header, body }]);
  },

  build: () => {
    return (
      searches
        .map(({ header, body }) => {
          const headerLine = JSON.stringify(header || {});
          const bodyLine = JSON.stringify(body);
          return `${headerLine}\n${bodyLine}`;
        })
        .join('\n') + '\n'
    );
  },

  buildArray: () => {
    return searches.flatMap(({ header, body }) => [header || {}, body]);
  }
});

/**
 * Create a new multi-search builder
 * @example
 * const ms = msearch<Product>()
 *   .addQuery(query1.build(), { index: 'products' })
 *   .addQuery(query2.build(), { index: 'products' })
 *   .build();
 */
export const msearch = <T>() => createMSearchBuilder<T>();
