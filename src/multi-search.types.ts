/**
 * Type definitions for Multi-Search API
 * Derived from official @elastic/elasticsearch types for accuracy and completeness.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-multi-search.html
 */

import type { MsearchMultisearchHeader } from '@elastic/elasticsearch/lib/api/types';
import type { FieldTypeString } from './index-management.types.js';
import { QueryState } from './query.types.js';

/**
 * Header options for each search in a multi-search request — re-exported from official @elastic/elasticsearch types
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-multi-search.html
 */
export type MSearchHeader = MsearchMultisearchHeader;

/**
 * A single search request in a multi-search operation
 */
export type MSearchRequest<M extends Record<string, FieldTypeString>> = {
  /** Optional header for this search */
  header?: MSearchHeader;
  /** The query body */
  body: QueryState<M>;
};

/**
 * Multi-search builder interface
 */
export type MSearchBuilder<M extends Record<string, FieldTypeString>> = {
  /** Add a search request with header and body */
  add: (request: MSearchRequest<M>) => MSearchBuilder<M>;
  /** Add a search using a query builder */
  addQuery: (body: QueryState<M>, header?: MSearchHeader) => MSearchBuilder<M>;
  /** Build as NDJSON string format for Elasticsearch */
  build: () => string;
  /** Build as array of objects (header, body pairs) */
  buildArray: () => Array<MSearchHeader | QueryState<M>>;
};
