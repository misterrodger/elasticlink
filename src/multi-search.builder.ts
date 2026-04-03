/**
 * Multi-Search API builder
 * Enables batching multiple search requests in a single API call
 */

import type { FieldTypeString } from './index-management.types.js';
import type { MappingsSchema } from './mapping.types.js';
import { MSearchBuilder, MSearchRequest, MSearchRequestParams } from './multi-search.types.js';

/**
 * Creates a multi-search builder
 * @returns MSearchBuilder instance
 */
export const createMSearchBuilder = <M extends Record<string, FieldTypeString>>(
  searches: MSearchRequest<M>[] = [],
  params: MSearchRequestParams = {}
): MSearchBuilder<M> => ({
  add: (request) => {
    return createMSearchBuilder<M>([...searches, request], params);
  },

  addQuery: (body, header = {}) => {
    return createMSearchBuilder<M>([...searches, { header, body }], params);
  },

  addQueryBuilder: (qb, header = {}) => {
    return createMSearchBuilder<M>([...searches, { header, body: qb.build() }], params);
  },

  withParams: (next) => {
    return createMSearchBuilder<M>(searches, { ...params, ...next });
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
  },

  // eslint-disable-next-line functional/functional-parameters
  buildParams: () => params
});

/**
 * Create a new multi-search builder
 * @example
 * const ms = msearch(productMappings)
 *   .addQueryBuilder(queryBuilder(productMappings).match('name', 'shoe'), { index: 'products' })
 *   .addQueryBuilder(queryBuilder(productMappings).match('name', 'shirt'), { index: 'products' })
 *   .withParams({ max_concurrent_searches: 5, typed_keys: true })
 *   .build();
 */
export const msearch = <M extends Record<string, FieldTypeString>>(_schema: MappingsSchema<M>) =>
  createMSearchBuilder<M>();
