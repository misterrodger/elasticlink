/**
 * Type definitions for Elasticsearch vector search and KNN queries
 * Derived from official @elastic/elasticsearch types for accuracy and completeness.
 * Requires Elasticsearch 8.0+
 */

import type { KnnSearch, MappingDenseVectorProperty } from '@elastic/elasticsearch/lib/api/types';

/**
 * Options for KNN (k-nearest neighbors) query (excludes 'field' and 'query_vector' which are handled by the builder)
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/knn-search.html
 */
export type KnnOptions = Omit<KnnSearch, 'field' | 'query_vector'>;

/**
 * Options for dense_vector field mapping (excludes 'type' which is always 'dense_vector')
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/dense-vector.html
 */
export type DenseVectorOptions = Omit<MappingDenseVectorProperty, 'type'>;
