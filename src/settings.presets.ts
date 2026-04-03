/**
 * Index settings presets for common Elasticsearch scenarios.
 *
 * These are standalone functions that return `IndicesIndexSettings` objects.
 * Use them with `indexBuilder().settings()` for index creation, or pass directly
 * to the ES `_settings` API for runtime changes.
 *
 * Typical lifecycle:
 * 1. Create index: `indexBuilder().mappings(schema).settings(productionSearchSettings()).build()`
 * 2. Before bulk ingest: apply `fastIngestSettings()` via ES `_settings` API
 * 3. Perform bulk ingest
 * 4. After bulk ingest: apply `productionSearchSettings()` via ES `_settings` API
 * 5. Refresh: `POST /index/_refresh`
 */

import type {
  IndicesIndexSettings,
  IndicesIndexSegmentSort,
  IndicesSegmentSortMode,
  IndicesSegmentSortMissing
} from '@elastic/elasticsearch/lib/api/types';

/**
 * Balanced production settings for search workloads.
 *
 * Defaults:
 * - `number_of_replicas: 1` — one replica for redundancy
 * - `refresh_interval: '5s'` — near-real-time search without excessive refresh overhead
 *
 * @param overrides - Override or extend any setting. Applied after defaults.
 *
 * @example
 * const index = indexBuilder()
 *   .mappings(schema)
 *   .settings(productionSearchSettings())
 *   .build();
 *
 * @example
 * // With best_compression for disk savings
 * productionSearchSettings({ codec: 'best_compression' })
 *
 * @example
 * // Restore production settings after bulk ingest
 * await client.indices.putSettings({
 *   index: 'my-index',
 *   body: productionSearchSettings(),
 * });
 * await client.indices.refresh({ index: 'my-index' });
 */
export const productionSearchSettings = (overrides?: Partial<IndicesIndexSettings>): IndicesIndexSettings => ({
  number_of_replicas: 1,
  refresh_interval: '5s',
  ...overrides
});

/**
 * Per-field sort configuration for `indexSortSettings()`.
 * Either a bare direction, or a full spec with `mode`/`missing`.
 */
export type IndexSortFieldSpec =
  | 'asc'
  | 'desc'
  | {
      order: 'asc' | 'desc';
      mode?: IndicesSegmentSortMode;
      missing?: IndicesSegmentSortMissing;
    };

/**
 * Generate index sort settings from a field→direction (or full spec) map.
 *
 * Index-time sorting improves compression (similar values stored together) and
 * enables early termination when query sort matches index sort. Combine with
 * `trackTotalHits(false)` for fastest sorted queries.
 *
 * The returned object lives at the top level of `IndicesIndexSettings` — spread it
 * directly into a settings object (do NOT wrap it under an `index` key, the
 * `@elastic/elasticsearch` client normalises that form).
 *
 * Pass a bare `'asc' | 'desc'` for simple cases; pass `{ order, mode?, missing? }`
 * when you need `mode` (`min`/`max`/`median`/`avg`) or `missing` (`_first`/`_last`).
 *
 * @param fields - Map of field names to sort direction or full spec.
 * @returns A `{ sort: IndicesIndexSegmentSort }` fragment to spread into your settings.
 *
 * @example
 * const index = indexBuilder()
 *   .mappings(schema)
 *   .settings({
 *     ...productionSearchSettings(),
 *     ...indexSortSettings({ timestamp: 'desc', status: 'asc' }),
 *   })
 *   .build();
 *
 * @example
 * indexSortSettings({
 *   price: { order: 'asc', mode: 'min', missing: '_last' },
 *   created_at: 'desc'
 * })
 */
export const indexSortSettings = (fields: Record<string, IndexSortFieldSpec>): { sort: IndicesIndexSegmentSort } => {
  const entries = Object.entries(fields);
  const normalize = (spec: IndexSortFieldSpec) => (typeof spec === 'string' ? { order: spec } : spec);
  const hasAnyMode = entries.some(([, spec]) => typeof spec !== 'string' && spec.mode !== undefined);
  const hasAnyMissing = entries.some(([, spec]) => typeof spec !== 'string' && spec.missing !== undefined);
  return {
    sort: {
      field: entries.map(([name]) => name),
      order: entries.map(([, spec]) => normalize(spec).order),
      ...(hasAnyMode && {
        mode: entries.map(([, spec]) => normalize(spec).mode ?? ('min' as IndicesSegmentSortMode))
      }),
      ...(hasAnyMissing && {
        missing: entries.map(([, spec]) => normalize(spec).missing ?? ('_last' as IndicesSegmentSortMissing))
      })
    }
  };
};

/**
 * Settings optimized for maximum indexing speed during bulk operations.
 *
 * Apply via the ES `_settings` API before starting bulk ingest, then revert
 * with `productionSearchSettings()` afterward. Do not use these as permanent
 * index settings — they trade durability and search availability for speed.
 *
 * Defaults:
 * - `refresh_interval: '-1'` — disables refresh (can improve reindex time by 70%+)
 * - `number_of_replicas: 0` — no replication overhead during ingest
 * - `translog.durability: 'async'` — async translog for faster writes
 * - `translog.sync_interval: '30s'` — less frequent translog sync
 *
 * @param overrides - Override or extend any setting. Applied after defaults.
 * `translog` overrides are deep-merged so individual translog keys can be
 * changed without clobbering the other defaults.
 *
 * @example
 * // Apply before bulk ingest via ES client
 * await client.indices.putSettings({
 *   index: 'my-index',
 *   body: fastIngestSettings(),
 * });
 *
 * @example
 * // With custom overrides
 * fastIngestSettings({ number_of_shards: 3 })
 */
export const fastIngestSettings = (overrides?: Partial<IndicesIndexSettings>): IndicesIndexSettings => {
  const { translog, ...rest } = overrides ?? {};
  return {
    number_of_replicas: 0,
    refresh_interval: '-1',
    translog: {
      durability: 'async',
      sync_interval: '30s',
      ...translog
    },
    ...rest
  };
};
