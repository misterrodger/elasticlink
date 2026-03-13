import type { FieldTypeString } from './index-management.types.js';
import type { QueryState, QueryBuilder, ClauseBuilder } from './query.types.js';
import type { SubFieldsOf } from './mapping.types.js';
import { createAggregationBuilder } from './aggregation.builder.js';
import { createSuggesterBuilder } from './suggester.builder.js';

const resolveCondition = (c: unknown): boolean =>
  typeof c === 'function' ? resolveCondition((c as () => unknown)()) : typeof c === 'boolean' ? c : c != null;

// wrap accepts `any` because this factory is shared: ClauseBuilder callers pass a wrap that returns raw DSL
// objects, while QueryBuilder callers pass a wrap that returns a new QueryBuilder<M>. The generic R captures
// the difference at each call site — `any` avoids a union type that would make every method's return type unreadable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createClauseMethods = <R>(wrap: (dsl: any) => R, qualifyField: (f: string) => string = (f) => f) => ({
  // eslint-disable-next-line functional/functional-parameters
  matchAll: () => wrap({ match_all: {} }),
  // eslint-disable-next-line functional/functional-parameters
  matchNone: () => wrap({ match_none: {} }),
  match: (field: string, value: string, options?: Record<string, unknown>) =>
    wrap({ match: { [qualifyField(field)]: options ? { query: value, ...options } : value } }),
  multiMatch: (fields: string[], query: string, options?: Record<string, unknown>) =>
    wrap({ multi_match: { fields: fields.map(qualifyField), query, ...(options ?? {}) } }),
  matchPhrase: (field: string, query: string) => wrap({ match_phrase: { [qualifyField(field)]: query } }),
  matchPhrasePrefix: (field: string, value: string, options?: Record<string, unknown>) =>
    wrap({ match_phrase_prefix: { [qualifyField(field)]: options ? { query: value, ...options } : value } }),
  term: (field: string, value: unknown) => wrap({ term: { [qualifyField(field)]: value } }),
  terms: (field: string, value: unknown[]) => wrap({ terms: { [qualifyField(field)]: value } }),
  range: (field: string, conditions: Record<string, unknown>) => wrap({ range: { [qualifyField(field)]: conditions } }),
  exists: (field: string) => wrap({ exists: { field: qualifyField(field) } }),
  prefix: (field: string, value: string) => wrap({ prefix: { [qualifyField(field)]: value } }),
  wildcard: (field: string, value: string) => wrap({ wildcard: { [qualifyField(field)]: value } }),
  fuzzy: (field: string, value: string, options?: Record<string, unknown>) =>
    wrap({ fuzzy: { [qualifyField(field)]: options ? { value, ...options } : { value } } }),
  ids: (values: string[]) => wrap({ ids: { values } }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  script: (options: any) => {
    const { source, lang = 'painless', params, boost } = options;
    return wrap({
      script: {
        script: { source, lang, ...(params !== undefined && { params }) },
        ...(boost !== undefined && { boost })
      }
    });
  },
  combinedFields: (fields: string[], query: string, options?: Record<string, unknown>) =>
    wrap({ combined_fields: { fields: fields.map(qualifyField), query, ...(options ?? {}) } }),
  queryString: (query: string, options?: Record<string, unknown>) =>
    wrap({ query_string: { query, ...(options ?? {}) } }),
  simpleQueryString: (query: string, options?: Record<string, unknown>) =>
    wrap({ simple_query_string: { query, ...(options ?? {}) } }),
  moreLikeThis: (
    fields: string[],
    like: string | Array<string | { _index: string; _id: string }>,
    options?: Record<string, unknown>
  ) =>
    wrap({
      more_like_this: {
        fields: fields.map(qualifyField),
        like: Array.isArray(like) ? like : [like],
        ...(options ?? {})
      }
    }),
  matchBoolPrefix: (field: string, value: string, options?: Record<string, unknown>) =>
    wrap({ match_bool_prefix: { [qualifyField(field)]: options ? { query: value, ...options } : value } })
});

const createClauseBuilder = <M extends Record<string, FieldTypeString>>(prefix?: string): ClauseBuilder<M> => {
  const qualifyField = prefix ? (f: string) => `${prefix}.${f}` : (f: string) => f;
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...createClauseMethods((dsl: any) => dsl, qualifyField),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    knn: (field: string, queryVector: number[], options: any) => {
      const { k, num_candidates, ...restOptions } = options;
      return {
        knn: {
          field: qualifyField(field),
          query_vector: queryVector,
          k,
          num_candidates,
          ...(restOptions ?? {})
        }
      };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nested: (path: string, fn: (q: any) => any, options?: Record<string, unknown>) => {
      const nestedPath = prefix ? `${prefix}.${path}` : path;
      const nestedQuery = fn(createClauseBuilder(nestedPath));
      return nestedQuery === undefined
        ? undefined
        : { nested: { path: nestedPath, query: nestedQuery, ...(options ?? {}) } };
    },
    when: (condition, thenFn) => (resolveCondition(condition) ? thenFn(createClauseBuilder(prefix)) : undefined)
  };
};

export const createQueryBuilder = <M extends Record<string, FieldTypeString>>(
  state: QueryState<M> = {}
): QueryBuilder<M> => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...createClauseMethods((dsl: any) => createQueryBuilder<M>({ ...state, query: dsl })),
  // eslint-disable-next-line functional/functional-parameters
  bool: () => createQueryBuilder<M>({ ...state, query: { bool: {} } }),
  must: (builderFn) => {
    const clause = builderFn(createClauseBuilder<M>());
    const existing = state.query?.bool?.must || [];
    return clause === undefined
      ? createQueryBuilder<M>(state)
      : createQueryBuilder<M>({ ...state, query: { bool: { ...state.query.bool, must: [...existing, clause] } } });
  },
  mustNot: (builderFn) => {
    const clause = builderFn(createClauseBuilder<M>());
    const existing = state.query?.bool?.must_not || [];
    return clause === undefined
      ? createQueryBuilder<M>(state)
      : createQueryBuilder<M>({ ...state, query: { bool: { ...state.query.bool, must_not: [...existing, clause] } } });
  },
  should: (builderFn) => {
    const clause = builderFn(createClauseBuilder<M>());
    const existing = state.query?.bool?.should || [];
    return clause === undefined
      ? createQueryBuilder<M>(state)
      : createQueryBuilder<M>({ ...state, query: { bool: { ...state.query.bool, should: [...existing, clause] } } });
  },
  filter: (builderFn) => {
    const clause = builderFn(createClauseBuilder<M>());
    const existing = state.query?.bool?.filter || [];
    return clause === undefined
      ? createQueryBuilder<M>(state)
      : createQueryBuilder<M>({ ...state, query: { bool: { ...state.query.bool, filter: [...existing, clause] } } });
  },
  minimumShouldMatch: (value) =>
    createQueryBuilder<M>({
      ...state,
      query: { bool: { ...state.query.bool, minimum_should_match: value } }
    }),
  knn: (field, queryVector, options) => {
    const { k, num_candidates, ...restOptions } = options;
    return createQueryBuilder<M>({
      ...state,
      knn: {
        field,
        query_vector: queryVector,
        k,
        num_candidates,
        ...(restOptions ?? {})
      }
    });
  },
  nested: (path, fn, options) => {
    const nestedQuery = fn(createClauseBuilder<SubFieldsOf<M, typeof path>>(path));
    return nestedQuery === undefined
      ? createQueryBuilder<M>(state)
      : createQueryBuilder<M>({
          ...state,
          query: { nested: { path, query: nestedQuery, ...(options ?? {}) } }
        });
  },
  scriptScore: (queryFn, script, options) => {
    const innerQuery = queryFn(createClauseBuilder<M>()) ?? { match_all: {} };
    const { source, lang = 'painless', params } = script;
    return createQueryBuilder<M>({
      ...state,
      query: {
        script_score: {
          query: innerQuery,
          script: { source, lang, ...(params !== undefined && { params }) },
          ...(options?.min_score !== undefined && { min_score: options.min_score }),
          ...(options?.boost !== undefined && { boost: options.boost })
        }
      }
    });
  },
  percolate: (options) => createQueryBuilder<M>({ ...state, query: { percolate: { ...options } } }),
  when: (condition, thenFn) =>
    resolveCondition(condition) ? thenFn(createQueryBuilder<M>(state)) : createQueryBuilder<M>(state),
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
  trackScores: (track_scores) => createQueryBuilder<M>({ ...state, track_scores }),
  explain: (explain) => createQueryBuilder<M>({ ...state, explain }),
  minScore: (min_score) => createQueryBuilder<M>({ ...state, min_score }),
  version: (version) => createQueryBuilder<M>({ ...state, version }),
  seqNoPrimaryTerm: (seq_no_primary_term) => createQueryBuilder<M>({ ...state, seq_no_primary_term }),
  trackTotalHits: (track_total_hits = true) => createQueryBuilder<M>({ ...state, track_total_hits }),
  highlight: (fields, options) => {
    const { pre_tags, post_tags, ...fieldOptions } = options || {};
    const fieldValue = Object.keys(fieldOptions).length > 0 ? fieldOptions : {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const highlightFields: Record<string, any> = Object.fromEntries(
      fields.map((field) => [field as string, fieldValue])
    );
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
      query: { geo_distance: { [field]: center, ...options } }
    }),
  geoBoundingBox: (field, options) =>
    createQueryBuilder<M>({
      ...state,
      query: { geo_bounding_box: { [field]: options } }
    }),
  geoPolygon: (field, options) =>
    createQueryBuilder<M>({
      ...state,
      query: { geo_polygon: { [field]: options } }
    }),
  geoShape: (field, shape, options) =>
    createQueryBuilder<M>({
      ...state,
      query: { geo_shape: { [field]: { shape, ...(options ?? {}) } } }
    }),
  regexp: (field, value, options) =>
    createQueryBuilder<M>({
      ...state,
      query: { regexp: { [field]: options ? { value, ...options } : value } }
    }),
  constantScore: (fn, options) => {
    const clause = fn(createClauseBuilder<M>());
    return createQueryBuilder<M>({
      ...state,
      query: {
        constant_score: {
          filter: clause,
          ...(options ?? {})
        }
      }
    });
  },
  searchAfter: (values) => createQueryBuilder<M>({ ...state, search_after: values }),
  preference: (value) => createQueryBuilder<M>({ ...state, preference: value }),
  collapse: (field, options) =>
    createQueryBuilder<M>({
      ...state,
      collapse: {
        field,
        ...(options ?? {})
      } as typeof state.collapse
    }),
  rescore: (queryFn, windowSize, options) => {
    const rescoreQuery = queryFn(createClauseBuilder<M>());
    return createQueryBuilder<M>({
      ...state,
      rescore: {
        window_size: windowSize,
        query: {
          rescore_query: rescoreQuery,
          ...(options ?? {})
        }
      }
    });
  },
  storedFields: (fields) => createQueryBuilder<M>({ ...state, stored_fields: fields }),
  terminateAfter: (count) => createQueryBuilder<M>({ ...state, terminate_after: count }),
  pit: (id, keepAlive) => createQueryBuilder<M>({ ...state, pit: { id, keep_alive: keepAlive } }),
  indicesBoost: (boosts) => createQueryBuilder<M>({ ...state, indices_boost: boosts }),
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
  // eslint-disable-next-line functional/functional-parameters
  build: () => {
    const { _includeQuery, ...rest } = state;
    // eslint-disable-next-line functional/no-conditional-statements
    if (_includeQuery === false) {
      const { query: _q, ...noQuery } = rest;
      return noQuery as QueryState<M>;
    }
    return rest as QueryState<M>;
  }
});
