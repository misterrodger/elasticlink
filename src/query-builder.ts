import { QueryState, QueryBuilder, ClauseBuilder } from './types';
import { createAggregationBuilder } from './aggregation-builder';

const createClauseBuilder = <T>(): ClauseBuilder<T> => ({
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
        script: {
          source,
          lang,
          ...(params ? { params } : {})
        },
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

const clauseBuilder = createClauseBuilder();

export const createQueryBuilder = <T>(
  state: QueryState<T> = {}
): QueryBuilder<T> => ({
  bool: () => createQueryBuilder<T>({ ...state, query: { bool: {} } }),

  must: (builderFn) => {
    const clause = builderFn(clauseBuilder);
    const existing = state.query?.bool?.must || [];
    return createQueryBuilder({
      ...state,
      query: { bool: { ...state.query.bool, must: [...existing, clause] } }
    });
  },

  mustNot: (builderFn) => {
    const clause = builderFn(clauseBuilder);
    const existing = state.query?.bool?.must_not || [];
    return createQueryBuilder({
      ...state,
      query: { bool: { ...state.query.bool, must_not: [...existing, clause] } }
    });
  },

  should: (builderFn) => {
    const clause = builderFn(clauseBuilder);
    const existing = state.query?.bool?.should || [];
    return createQueryBuilder({
      ...state,
      query: { bool: { ...state.query.bool, should: [...existing, clause] } }
    });
  },

  filter: (builderFn) => {
    const clause = builderFn(clauseBuilder);
    const existing = state.query?.bool?.filter || [];
    return createQueryBuilder({
      ...state,
      query: { bool: { ...state.query.bool, filter: [...existing, clause] } }
    });
  },

  minimumShouldMatch: (value) => {
    return createQueryBuilder({
      ...state,
      query: { bool: { ...state.query.bool, minimum_should_match: value } }
    });
  },

  matchAll: () => createQueryBuilder<T>({ ...state, query: { match_all: {} } }),
  match: (field, value, options) => {
    if (!options || Object.keys(options).length === 0) {
      return createQueryBuilder<T>({
        ...state,
        query: { match: { [field]: value } }
      });
    }
    return createQueryBuilder<T>({
      ...state,
      query: { match: { [field]: { query: value, ...options } } }
    });
  },
  multiMatch: (fields, query, options) => {
    if (!options || Object.keys(options).length === 0) {
      return createQueryBuilder<T>({
        ...state,
        query: { multi_match: { fields, query } }
      });
    }
    return createQueryBuilder<T>({
      ...state,
      query: { multi_match: { fields, query, ...options } }
    });
  },
  term: (field, value) =>
    createQueryBuilder<T>({ ...state, query: { term: { [field]: value } } }),
  matchPhrase: (field, value) =>
    createQueryBuilder<T>({
      ...state,
      query: { match_phrase: { [field]: value } }
    }),
  matchPhrasePrefix: (field, value, options) => {
    if (!options || Object.keys(options).length === 0) {
      return createQueryBuilder<T>({
        ...state,
        query: { match_phrase_prefix: { [field]: value } }
      });
    }
    return createQueryBuilder<T>({
      ...state,
      query: { match_phrase_prefix: { [field]: { query: value, ...options } } }
    });
  },
  terms: (field, value) =>
    createQueryBuilder<T>({ ...state, query: { terms: { [field]: value } } }),
  exists: (field) =>
    createQueryBuilder<T>({ ...state, query: { exists: { field } } }),
  prefix: (field, value) =>
    createQueryBuilder<T>({ ...state, query: { prefix: { [field]: value } } }),
  wildcard: (field, value) =>
    createQueryBuilder<T>({
      ...state,
      query: { wildcard: { [field]: value } }
    }),
  fuzzy: (field, value, options) => {
    if (!options || Object.keys(options).length === 0) {
      return createQueryBuilder<T>({
        ...state,
        query: { fuzzy: { [field]: { value } } }
      });
    }
    return createQueryBuilder<T>({
      ...state,
      query: { fuzzy: { [field]: { value, ...options } } }
    });
  },

  ids: (values) =>
    createQueryBuilder<T>({
      ...state,
      query: { ids: { values } }
    }),

  nested: (path, fn, options) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nestedQuery = fn(createClauseBuilder<any>());
    return createQueryBuilder<T>({
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
    return createQueryBuilder<T>({
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
    return createQueryBuilder<T>({
      ...state,
      query: {
        script: {
          script: {
            source,
            lang,
            ...(params ? { params } : {})
          },
          ...(boost ? { boost } : {})
        }
      }
    });
  },

  scriptScore: (queryFn, script, options) => {
    const innerQuery = queryFn(clauseBuilder);
    const { source, lang = 'painless', params } = script;
    return createQueryBuilder<T>({
      ...state,
      query: {
        script_score: {
          query: innerQuery,
          script: {
            source,
            lang,
            ...(params ? { params } : {})
          },
          ...(options?.min_score !== undefined
            ? { min_score: options.min_score }
            : {}),
          ...(options?.boost ? { boost: options.boost } : {})
        }
      }
    });
  },

  percolate: (options) => {
    return createQueryBuilder<T>({
      ...state,
      query: {
        percolate: {
          ...options
        }
      }
    });
  },

  when: (condition, thenFn, elseFn) => {
    if (condition) {
      return thenFn(createQueryBuilder<T>(state));
    }
    return elseFn ? elseFn(createQueryBuilder<T>(state)) : undefined;
  },

  range: (field, conditions) =>
    createQueryBuilder({ ...state, query: { range: { [field]: conditions } } }),

  // Sort implementation
  sort: (field, direction = 'asc') => {
    const existing = state.sort || [];
    return createQueryBuilder({
      ...state,
      sort: [
        ...existing,
        { [field]: direction } as { [P in keyof T]: 'asc' | 'desc' }
      ]
    });
  },

  // Pagination & source
  from: (from) => createQueryBuilder({ ...state, from }),
  to: (to) => createQueryBuilder({ ...state, to }),
  size: (size) => createQueryBuilder({ ...state, size }),
  _source: (_source) => createQueryBuilder({ ...state, _source }),

  // Query parameters
  timeout: (timeout) => createQueryBuilder({ ...state, timeout }),
  trackScores: (track_scores) => createQueryBuilder({ ...state, track_scores }),
  explain: (explain) => createQueryBuilder({ ...state, explain }),
  minScore: (min_score) => createQueryBuilder({ ...state, min_score }),
  version: (version) => createQueryBuilder({ ...state, version }),
  seqNoPrimaryTerm: (seq_no_primary_term) =>
    createQueryBuilder({ ...state, seq_no_primary_term }),

  trackTotalHits: (track_total_hits) =>
    createQueryBuilder({ ...state, track_total_hits }),

  highlight: (fields, options) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const highlightFields: Record<string, any> = {};
    for (const field of fields) {
      highlightFields[field as string] = options || {};
    }
    return createQueryBuilder({
      ...state,
      highlight: {
        fields: highlightFields,
        ...(options?.pre_tags && { pre_tags: options.pre_tags }),
        ...(options?.post_tags && { post_tags: options.post_tags })
      }
    });
  },

  // Geo queries
  geoDistance: (field, center, options) =>
    createQueryBuilder<T>({
      ...state,
      query: {
        geo_distance: {
          [String(field)]: center,
          ...options
        }
      }
    }),

  geoBoundingBox: (field, options) =>
    createQueryBuilder<T>({
      ...state,
      query: {
        geo_bounding_box: {
          [String(field)]: options
        }
      }
    }),

  geoPolygon: (field, options) =>
    createQueryBuilder<T>({
      ...state,
      query: {
        geo_polygon: {
          [String(field)]: options
        }
      }
    }),

  // Pattern and scoring queries
  regexp: (field, value, options) => {
    if (!options || Object.keys(options).length === 0) {
      return createQueryBuilder<T>({
        ...state,
        query: { regexp: { [String(field)]: value } }
      });
    }
    return createQueryBuilder<T>({
      ...state,
      query: { regexp: { [String(field)]: { value, ...options } } }
    });
  },

  constantScore: (fn, options) => {
    const clause = fn(clauseBuilder);
    return createQueryBuilder<T>({
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
    const aggBuilder = createAggregationBuilder<T>();
    const builtAggs = fn(aggBuilder).build();
    return createQueryBuilder({ ...state, aggs: builtAggs });
  },

  build: () => {
    const { _includeQuery, ...rest } = state;
    if (_includeQuery === false) {
      const { query: _q, ...noQuery } = rest;
      return noQuery as QueryState<T>;
    }
    return rest as QueryState<T>;
  }
});
