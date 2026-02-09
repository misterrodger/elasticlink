/**
 * Type definitions for Bulk API
 * Derived from official @elastic/elasticsearch types for accuracy and completeness.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html
 */

import type {
  BulkIndexOperation,
  BulkCreateOperation,
  BulkUpdateOperation,
  BulkUpdateAction,
  BulkDeleteOperation
} from '@elastic/elasticsearch/lib/api/types';

/**
 * Metadata for bulk index operation — re-exported from official @elastic/elasticsearch types
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html
 */
export type BulkIndexMeta = BulkIndexOperation;

/**
 * Metadata for bulk create operation — re-exported from official @elastic/elasticsearch types
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html
 */
export type BulkCreateMeta = BulkCreateOperation;

/**
 * Metadata for bulk update operation.
 * Combines official BulkUpdateOperation (header) with BulkUpdateAction (body) for ergonomic API.
 * The builder splits these into separate header and body when building the bulk request.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html
 */
export type BulkUpdateMeta<T> = BulkUpdateOperation &
  BulkUpdateAction<T, Partial<T>>;

/**
 * Metadata for bulk delete operation — re-exported from official @elastic/elasticsearch types
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html
 */
export type BulkDeleteMeta = BulkDeleteOperation;

/**
 * Bulk operations builder interface
 */
export type BulkBuilder<T> = {
  /** Index a document (create or replace) */
  index: (doc: T, meta?: BulkIndexMeta) => BulkBuilder<T>;
  /** Create a new document (fails if already exists) */
  create: (doc: T, meta?: BulkCreateMeta) => BulkBuilder<T>;
  /** Update an existing document */
  update: (meta: BulkUpdateMeta<T>) => BulkBuilder<T>;
  /** Delete a document */
  delete: (meta: BulkDeleteMeta) => BulkBuilder<T>;
  /** Build as NDJSON string format for Elasticsearch */
  build: () => string;
  /** Build as array of objects */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildArray: () => any[];
};
