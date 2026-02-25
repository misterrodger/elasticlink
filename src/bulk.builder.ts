/**
 * Bulk API builder
 * Enables batching multiple index/create/update/delete operations
 */

import type { FieldTypeString } from './index-management.types.js';
import type { MappingsSchema, Infer } from './mapping.types.js';
import { BulkBuilder } from './bulk.types.js';

/**
 * Creates a bulk operations builder
 * @returns BulkBuilder instance
 */
export const createBulkBuilder = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operations: any[] = []
): BulkBuilder<T> => ({
  index: (doc, meta = {}) => {
    return createBulkBuilder<T>([...operations, { index: meta }, doc]);
  },

  create: (doc, meta = {}) => {
    return createBulkBuilder<T>([...operations, { create: meta }, doc]);
  },

  update: (meta) => {
    const { doc, script, upsert, doc_as_upsert, ...header } = meta;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateDoc: any = {};
    if (doc) updateDoc.doc = doc;
    if (script) updateDoc.script = script;
    if (upsert) updateDoc.upsert = upsert;
    if (doc_as_upsert !== undefined) updateDoc.doc_as_upsert = doc_as_upsert;

    return createBulkBuilder<T>([...operations, { update: header }, updateDoc]);
  },

  delete: (meta) => {
    return createBulkBuilder<T>([...operations, { delete: meta }]);
  },

  build: () => {
    return operations.map((op) => JSON.stringify(op)).join('\n') + '\n';
  },

  buildArray: () => operations
});

/**
 * Create a new bulk operations builder.
 * `.build()` returns an NDJSON string (newline-delimited JSON) ready to POST to `/_bulk`.
 * `.buildArray()` returns the raw operation objects if you need to inspect or transform them.
 * @example
 * const ndjson = bulk<Product>()
 *   .index({ id: '1', name: 'Product 1' }, { _index: 'products', _id: '1' })
 *   .create({ id: '2', name: 'Product 2' }, { _index: 'products', _id: '2' })
 *   .update({ _index: 'products', _id: '3', doc: { name: 'Updated' } })
 *   .delete({ _index: 'products', _id: '4' })
 *   .build(); // POST to /_bulk with Content-Type: application/x-ndjson
 */
export const bulk = <M extends Record<string, FieldTypeString>>(
  _schema: MappingsSchema<M>
) => createBulkBuilder<Infer<MappingsSchema<M>>>();
