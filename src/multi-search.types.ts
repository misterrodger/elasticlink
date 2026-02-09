/**
 * Type definitions for Multi-Search API
 * Derived from official @elastic/elasticsearch types for accuracy and completeness.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-multi-search.html
 */

import type { MsearchMultisearchHeader } from '@elastic/elasticsearch/lib/api/types';
import { QueryState } from './query.types.js';

/**
 * Header options for each search in a multi-search request — re-exported from official @elastic/elasticsearch types
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-multi-search.html
 */
export type MSearchHeader = MsearchMultisearchHeader;

/**
 * A single search request in a multi-search operation
 */
export type MSearchRequest<T> = {
  /** Optional header for this search */
  header?: MSearchHeader;
  /** The query body */
  body: QueryState<T>;
};

/**
 * Multi-search builder interface
 */
export type MSearchBuilder<T> = {
  /** Add a search request with header and body */
  add: (request: MSearchRequest<T>) => MSearchBuilder<T>;
  /** Add a search using a query builder */
  addQuery: (body: QueryState<T>, header?: MSearchHeader) => MSearchBuilder<T>;
  /** Build as NDJSON string format for Elasticsearch */
  build: () => string;
  /** Build as array of objects (header, body pairs) */
  buildArray: () => Array<MSearchHeader | QueryState<T>>;
};
