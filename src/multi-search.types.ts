/**
 * Type definitions for Multi-Search API
 * Derived from official @elastic/elasticsearch types for accuracy and completeness.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-multi-search.html
 */

import type { MsearchMultisearchHeader, MsearchRequest } from '@elastic/elasticsearch/lib/api/types';
import type { FieldTypeString } from './index-management.types.js';
import { QueryState, QueryBuilder } from './query.types.js';

/**
 * Request-level parameters for a multi-search request — mirrors the subset of
 * the official `MsearchRequest` type that is set at the top of the request
 * (rather than per-sub-search). The builder applies these via
 * `.withParams({...})` and exposes them on `.buildParams()` so callers can
 * spread them into `client.msearch({...params, body: ndjson})`.
 */
export type MSearchRequestParams = Pick<
  MsearchRequest,
  | 'max_concurrent_searches'
  | 'max_concurrent_shard_requests'
  | 'pre_filter_shard_size'
  | 'rest_total_hits_as_int'
  | 'typed_keys'
  | 'ccs_minimize_roundtrips'
  | 'search_type'
  | 'routing'
>;

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
  /** Add a search using a pre-built query state */
  addQuery: (body: QueryState<M>, header?: MSearchHeader) => MSearchBuilder<M>;
  /** Add a search using a QueryBuilder directly — convenience over `.addQuery(qb.build(), header)` */
  addQueryBuilder: (qb: QueryBuilder<M>, header?: MSearchHeader) => MSearchBuilder<M>;
  /** Set request-level params (e.g. `max_concurrent_searches`, `typed_keys`). Merges with any previously set params. */
  withParams: (params: MSearchRequestParams) => MSearchBuilder<M>;
  /** Build as NDJSON string format for Elasticsearch */
  build: () => string;
  /** Build as array of objects (header, body pairs) */
  buildArray: () => Array<MSearchHeader | QueryState<M>>;
  /** Return the request-level params set via `.withParams()`, for spreading into `client.msearch()`. */
  buildParams: () => MSearchRequestParams;
};
