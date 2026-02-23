/**
 * Query builder implementation
 * Builds type-safe Elasticsearch queries with a fluent API
 */

import type { FieldTypeString } from './index-management.types.js';
import type { QueryState, QueryBuilder, ClauseBuilder } from './query.types.js';
import { createAggregationBuilder } from './aggregation.builder.js';
import { createSuggesterBuilder } from './suggester.builder.js';

const createClauseBuilder = <
  M extends Record<string, FieldTypeString>
>(): ClauseBuilder<M> => ({
  matchAll: () => ({ match_all: {} }),
  match: (field, value, options) => {
    if (!options || Object.keys(options).length === 0) {
      return { match: { [field]: value } };
    }
    return { match: { [field]: { query: value, ...options } } };
  },
  multiMatch: (fields, query, options) => {
    if (!options || Object.keys(options).length === 0) {
      return { multi_match: { fields, query } };
    }
    return { multi_match: { fields, query, ...options } };
  },
  matchPhrase: (field, query) => ({ match_phrase: { [field]: query } }),
  matchPhrasePrefix: (field, value, options) => {
    if (!options || Object.keys(options).length === 0) {
      return { match_phrase_prefix: { [field]: value } };
    }
    return { match_phrase_prefix: { [field]: { query: value, ...options } } };
  },
  term: (field, value) => ({ term: { [field]: value } }),
  terms: (field, value) => ({ terms: { [field]: value } }),
  range: (field, conditions) => ({ range: { [field]: conditions } }),
  exists: (field) => ({ exists: { field } }),
  prefix: (field, value) => ({ prefix: { [field]: value } }),
  wildcard: (field, value) => ({ wildcard: { [field]: value } }),
  fuzzy: (field, value, options) => {
    if (!options || Object.keys(options).length === 0) {
      return { fuzzy: { [field]: { value } } };
    }
    return { fuzzy: { [field]: { value, ...options } } };
  },
  ids: (values) => ({ ids: { values } }),
  knn: (field, queryVector, options) => {
    const { k, num_candidates, filter, boost, similarity } = options;
    return {
      knn: {
        field: String(field),
        query_vector: queryVector,
        k,
        num_candidates,
        ...(filter ? { filter } : {}),
        ...(boost ? { boost } : {}),
        ...(similarity !== undefined ? { similarity } : {})
      }
    };
  },
  script: (options) => {
    const { source, lang = 'painless', params, boost } = options;
    return {
      script: {
        script: { source, lang, ...(params ? { params } : {}) },
        ...(boost ? { boost } : {})
      }
    };
  },
  when: (condition, thenFn, elseFn) => {
    if (condition) {
      return thenFn(createClauseBuilder());
    }
    return elseFn ? elseFn(createClauseBuilder()) : undefined;
  }
});

export const createQueryBuilder = <M extends Record<string, FieldTypeString>>(
  state: QueryState<M> = {}
): QueryBuilder<M> => ({
  bool: () => createQueryBuilder<M>({ ...state, query: { bool: {} } }),

  must: (builderFn) => {
    const clause = builderFn(createClauseBuilder<M>());
    const existing = state.query?.bool?.must || [];
    return createQueryBuilder<M>({
      ...state,
      query: { bool: { ...state.query.bool, must: [...existing, clause] } }
    });
  },

  mustNot: (builderFn) => {
    const clause = builderFn(createClauseBuilder<M>());
    const existing = state.query?.bool?.must_not || [];
    return createQueryBuilder<M>({
      ...state,
      query: { bool: { ...state.query.bool, must_not: [...existing, clause] } }
    });
  },

  should: (builderFn) => {
    const clause = builderFn(createClauseBuilder<M>());
    const existing = state.query?.bool?.should || [];
    return createQueryBuilder<M>({
      ...state,
      query: { bool: { ...state.query.bool, should: [...existing, clause] } }
    });
  },

  filter: (builderFn) => {
    const clause = builderFn(createClauseBuilder<M>());
    const existing = state.query?.bool?.filter || [];
    return createQueryBuilder<M>({
      ...state,
      query: { bool: { ...state.query.bool, filter: [...existing, clause] } }
    });
  },

  minimumShouldMatch: (value) =>
    createQueryBuilder<M>({
      ...state,
      query: { bool: { ...state.query.bool, minimum_should_match: value } }
    }),

  matchAll: () => createQueryBuilder<M>({ ...state, query: { match_all: {} } }),
  match: (field, value, options) => {
    if (!options || Object.keys(options).length === 0) {
      return createQueryBuilder<M>({
        ...state,
        query: { match: { [field]: value } }
      });
    }
    return createQueryBuilder<M>({
      ...state,
      query: { match: { [field]: { query: value, ...options } } }
    });
  },
  multiMatch: (fields, query, options) => {
    if (!options || Object.keys(options).length === 0) {
      return createQueryBuilder<M>({
        ...state,
        query: { multi_match: { fields, query } }
      });
    }
    return createQueryBuilder<M>({
      ...state,
      query: { multi_match: { fields, query, ...options } }
    });
  },
  matchPhrase: (field, value) =>
    createQueryBuilder<M>({
      ...state,
      query: { match_phrase: { [field]: value } }
    }),
  matchPhrasePrefix: (field, value, options) => {
    if (!options || Object.keys(options).length === 0) {
      return createQueryBuilder<M>({
        ...state,
        query: { match_phrase_prefix: { [field]: value } }
      });
    }
    return createQueryBuilder<M>({
      ...state,
      query: { match_phrase_prefix: { [field]: { query: value, ...options } } }
    });
  },

  term: (field, value) =>
    createQueryBuilder<M>({ ...state, query: { term: { [field]: value } } }),
  terms: (field, values) =>
    createQueryBuilder<M>({ ...state, query: { terms: { [field]: values } } }),
  range: (field, conditions) =>
    createQueryBuilder<M>({
      ...state,
      query: { range: { [field]: conditions } }
    }),
  exists: (field) =>
    createQueryBuilder<M>({ ...state, query: { exists: { field } } }),
  prefix: (field, value) =>
    createQueryBuilder<M>({ ...state, query: { prefix: { [field]: value } } }),
  wildcard: (field, value) =>
    createQueryBuilder<M>({
      ...state,
      query: { wildcard: { [field]: value } }
    }),
  fuzzy: (field, value, options) => {
    if (!options || Object.keys(options).length === 0) {
      return createQueryBuilder<M>({
        ...state,
        query: { fuzzy: { [field]: { value } } }
      });
    }
    return createQueryBuilder<M>({
      ...state,
      query: { fuzzy: { [field]: { value, ...options } } }
    });
  },
  ids: (values) =>
    createQueryBuilder<M>({ ...state, query: { ids: { values } } }),

  nested: (path, fn, options) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nestedQuery = fn(createClauseBuilder<any>());
    return createQueryBuilder<M>({
      ...state,
      query: {
        nested: {
          path,
          query: nestedQuery,
          ...(options && Object.keys(options).length > 0 ? options : {})
        }
      }
    });
  },

  knn: (field, queryVector, options) => {
    const { k, num_candidates, filter, boost, similarity } = options;
    return createQueryBuilder<M>({
      ...state,
      knn: {
        field: String(field),
        query_vector: queryVector,
        k,
        num_candidates,
        ...(filter ? { filter } : {}),
        ...(boost ? { boost } : {}),
        ...(similarity !== undefined ? { similarity } : {})
      }
    });
  },

  script: (options) => {
    const { source, lang = 'painless', params, boost } = options;
    return createQueryBuilder<M>({
      ...state,
      query: {
        script: {
          script: { source, lang, ...(params ? { params } : {}) },
          ...(boost ? { boost } : {})
        }
      }
    });
  },

  scriptScore: (queryFn, script, options) => {
    const innerQuery = queryFn(createClauseBuilder<M>());
    const { source, lang = 'painless', params } = script;
    return createQueryBuilder<M>({
      ...state,
      query: {
        script_score: {
          query: innerQuery,
          script: { source, lang, ...(params ? { params } : {}) },
          ...(options?.min_score !== undefined
            ? { min_score: options.min_score }
            : {}),
          ...(options?.boost ? { boost: options.boost } : {})
        }
      }
    });
  },

  percolate: (options) =>
    createQueryBuilder<M>({ ...state, query: { percolate: { ...options } } }),

  when: (condition, thenFn, elseFn) => {
    if (condition) {
      return thenFn(createQueryBuilder<M>(state));
    }
    return elseFn ? elseFn(createQueryBuilder<M>(state)) : undefined;
  },

  sort: (field, direction = 'asc') => {
    const existing = state.sort || [];
    return createQueryBuilder<M>({
      ...state,
      sort: [...existing, { [field]: direction }]
    });
  },

  from: (from) => createQueryBuilder<M>({ ...state, from }),
  size: (size) => createQueryBuilder<M>({ ...state, size }),
  _source: (_source) => createQueryBuilder<M>({ ...state, _source }),
  timeout: (timeout) => createQueryBuilder<M>({ ...state, timeout }),
  trackScores: (track_scores) =>
    createQueryBuilder<M>({ ...state, track_scores }),
  explain: (explain) => createQueryBuilder<M>({ ...state, explain }),
  minScore: (min_score) => createQueryBuilder<M>({ ...state, min_score }),
  version: (version) => createQueryBuilder<M>({ ...state, version }),
  seqNoPrimaryTerm: (seq_no_primary_term) =>
    createQueryBuilder<M>({ ...state, seq_no_primary_term }),
  trackTotalHits: (track_total_hits = true) =>
    createQueryBuilder<M>({ ...state, track_total_hits }),

  highlight: (fields, options) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const highlightFields: Record<string, any> = {};
    const { pre_tags, post_tags, ...fieldOptions } = options || {};
    for (const field of fields) {
      highlightFields[field as string] =
        Object.keys(fieldOptions).length > 0 ? fieldOptions : {};
    }
    return createQueryBuilder<M>({
      ...state,
      highlight: {
        fields: highlightFields,
        ...(pre_tags && { pre_tags }),
        ...(post_tags && { post_tags })
      }
    });
  },

  geoDistance: (field, center, options) =>
    createQueryBuilder<M>({
      ...state,
      query: { geo_distance: { [String(field)]: center, ...options } }
    }),

  geoBoundingBox: (field, options) =>
    createQueryBuilder<M>({
      ...state,
      query: { geo_bounding_box: { [String(field)]: options } }
    }),

  geoPolygon: (field, options) =>
    createQueryBuilder<M>({
      ...state,
      query: { geo_polygon: { [String(field)]: options } }
    }),

  regexp: (field, value, options) => {
    if (!options || Object.keys(options).length === 0) {
      return createQueryBuilder<M>({
        ...state,
        query: { regexp: { [String(field)]: value } }
      });
    }
    return createQueryBuilder<M>({
      ...state,
      query: { regexp: { [String(field)]: { value, ...options } } }
    });
  },

  constantScore: (fn, options) => {
    const clause = fn(createClauseBuilder<M>());
    return createQueryBuilder<M>({
      ...state,
      query: {
        constant_score: {
          filter: clause,
          ...(options && Object.keys(options).length > 0 ? options : {})
        }
      }
    });
  },

  aggs: (fn) => {
    const aggBuilder = createAggregationBuilder<M>();
    const builtAggs = fn(aggBuilder).build();
    return createQueryBuilder<M>({ ...state, aggs: builtAggs });
  },

  suggest: (fn) => {
    const suggesterBuilder = createSuggesterBuilder<M>();
    const builtSuggestions = fn(suggesterBuilder).build();
    return createQueryBuilder<M>({
      ...state,
      suggest: builtSuggestions.suggest
    });
  },

  build: () => {
    const { _includeQuery, ...rest } = state;
    if (_includeQuery === false) {
      const { query: _q, ...noQuery } = rest;
      return noQuery as QueryState<M>;
    }
    return rest as QueryState<M>;
  }
});
