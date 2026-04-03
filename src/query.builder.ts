import type { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import type { FieldTypeString } from './index-management.types.js';
import type {
  QueryState,
  QueryBuilder,
  ClauseBuilder,
  MatchOptions,
  MultiMatchOptions,
  MatchPhrasePrefixOptions,
  FuzzyOptions,
  CombinedFieldsOptions,
  QueryStringOptions,
  SimpleQueryStringOptions,
  MoreLikeThisOptions,
  MatchBoolPrefixOptions,
  NestedOptions,
  ScriptQueryOptions,
  HighlightOptions,
  RegexpOptions,
  GeoDistanceOptions,
  GeoBoundingBoxOptions,
  GeoPolygonOptions,
  GeoShapeQueryOptions,
  DistanceFeatureOptions,
  RankFeatureQueryOptions,
  SparseVectorQueryOptions,
  FunctionScoreOptions,
  HasChildOptions,
  HasParentOptions,
  ParentIdOptions,
  IntervalsOptions,
  SpanNearOptions,
  SpanNotOptions,
  SpanQuery
} from './query.types.js';
import type { SubFieldsOf } from './mapping.types.js';
import type { KnnOptions } from './vector.types.js';
import { createAggregationBuilder } from './aggregation.builder.js';
import { createSuggesterBuilder } from './suggester.builder.js';

// prettier-ignore
const resolveCondition = (c: unknown): boolean =>
  typeof c === 'function'
    ? resolveCondition((c as () => unknown)())
    : typeof c === 'boolean'
      ? c
      : c != null;

// wrap accepts `any` because this factory is shared: ClauseBuilder callers pass a wrap that returns raw DSL
// objects, while QueryBuilder callers pass a wrap that returns a new QueryBuilder<M>. The generic R captures
// the difference at each call site — `any` avoids a union type that would make every method's return type unreadable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createClauseMethods = <R>(wrap: (dsl: any) => R, qualifyField: (f: string) => string = (f) => f) => ({
  // eslint-disable-next-line functional/functional-parameters
  matchAll: () => wrap({ match_all: {} }),

  // eslint-disable-next-line functional/functional-parameters
  matchNone: () => wrap({ match_none: {} }),

  match: (field: string, value: string, options?: MatchOptions) =>
    wrap({ match: { [qualifyField(field)]: options ? { query: value, ...options } : value } }),

  multiMatch: (fields: string[], query: string, options?: MultiMatchOptions) =>
    wrap({ multi_match: { fields: fields.map(qualifyField), query, ...options } }),

  matchPhrase: (field: string, query: string) => wrap({ match_phrase: { [qualifyField(field)]: query } }),

  matchPhrasePrefix: (field: string, value: string, options?: MatchPhrasePrefixOptions) =>
    wrap({ match_phrase_prefix: { [qualifyField(field)]: options ? { query: value, ...options } : value } }),

  term: (field: string, value: unknown) => wrap({ term: { [qualifyField(field)]: value } }),

  terms: (field: string, value: unknown[]) => wrap({ terms: { [qualifyField(field)]: value } }),

  range: (field: string, conditions: Record<string, unknown>) => wrap({ range: { [qualifyField(field)]: conditions } }),

  exists: (field: string) => wrap({ exists: { field: qualifyField(field) } }),

  prefix: (field: string, value: string) => wrap({ prefix: { [qualifyField(field)]: value } }),

  wildcard: (field: string, value: string) => wrap({ wildcard: { [qualifyField(field)]: value } }),

  fuzzy: (field: string, value: string, options?: FuzzyOptions) =>
    wrap({ fuzzy: { [qualifyField(field)]: options ? { value, ...options } : { value } } }),

  ids: (values: string[]) => wrap({ ids: { values } }),

  script: (options: ScriptQueryOptions) => {
    const { source, lang = 'painless', params, boost } = options;
    return wrap({
      script: {
        script: { source, lang, ...(params !== undefined && { params }) },
        ...(boost !== undefined && { boost })
      }
    });
  },

  combinedFields: (fields: string[], query: string, options?: CombinedFieldsOptions) =>
    wrap({ combined_fields: { fields: fields.map(qualifyField), query, ...options } }),

  queryString: (query: string, options?: QueryStringOptions) => wrap({ query_string: { query, ...options } }),

  simpleQueryString: (query: string, options?: SimpleQueryStringOptions) =>
    wrap({ simple_query_string: { query, ...options } }),

  moreLikeThis: (
    fields: string[],
    like: string | Array<string | { _index: string; _id: string }>,
    options?: MoreLikeThisOptions
  ) =>
    wrap({
      more_like_this: {
        fields: fields.map(qualifyField),
        like: Array.isArray(like) ? like : [like],
        ...options
      }
    }),

  matchBoolPrefix: (field: string, value: string, options?: MatchBoolPrefixOptions) =>
    wrap({ match_bool_prefix: { [qualifyField(field)]: options ? { query: value, ...options } : value } }),

  regexp: (field: string, value: string, options?: RegexpOptions) =>
    wrap({ regexp: { [qualifyField(field)]: options ? { value, ...options } : value } }),

  geoDistance: (field: string, center: { lat: number; lon: number }, options: GeoDistanceOptions) =>
    wrap({ geo_distance: { [qualifyField(field)]: center, ...options } }),

  geoBoundingBox: (field: string, options: GeoBoundingBoxOptions) =>
    wrap({ geo_bounding_box: { [qualifyField(field)]: options } }),

  geoPolygon: (field: string, options: GeoPolygonOptions) => wrap({ geo_polygon: { [qualifyField(field)]: options } }),

  geoShape: (field: string, shape: Record<string, unknown>, options?: GeoShapeQueryOptions) =>
    wrap({ geo_shape: { [qualifyField(field)]: { shape, ...options } } }),

  distanceFeature: (field: string, options: DistanceFeatureOptions) =>
    wrap({ distance_feature: { field: qualifyField(field), ...options } }),

  rankFeature: (field: string, options?: RankFeatureQueryOptions) =>
    wrap({ rank_feature: { field: qualifyField(field), ...options } }),

  sparseVector: (field: string, options: SparseVectorQueryOptions) =>
    wrap({ sparse_vector: { field: qualifyField(field), ...options } }),

  intervals: (field: string, options: IntervalsOptions) => wrap({ intervals: { [qualifyField(field)]: options } }),

  spanTerm: (field: string, value: string) => wrap({ span_term: { [qualifyField(field)]: { value } } }),

  spanNear: (clauses: ReadonlyArray<SpanQuery>, options?: SpanNearOptions) =>
    wrap({ span_near: { clauses: [...clauses], ...options } }),

  spanOr: (clauses: ReadonlyArray<SpanQuery>) => wrap({ span_or: { clauses: [...clauses] } }),

  spanNot: (include: SpanQuery, exclude: SpanQuery, options?: SpanNotOptions) =>
    wrap({ span_not: { include, exclude, ...options } }),

  spanFirst: (match: SpanQuery, end: number) => wrap({ span_first: { match, end } }),

  spanContaining: (big: SpanQuery, little: SpanQuery) => wrap({ span_containing: { big, little } }),

  spanWithin: (big: SpanQuery, little: SpanQuery) => wrap({ span_within: { big, little } }),

  spanMultiTerm: (query: Record<string, unknown>) => wrap({ span_multi: { match: query } }),

  spanFieldMasking: (field: string, query: SpanQuery) =>
    wrap({ span_field_masking: { field: qualifyField(field), query } })
});

const createClauseBuilder = <M extends Record<string, FieldTypeString>>(prefix?: string): ClauseBuilder<M> => {
  const qualifyField = prefix ? (f: string) => `${prefix}.${f}` : (f: string) => f;
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...createClauseMethods((dsl: any) => dsl, qualifyField),

    knn: (field: string, queryVector: number[], options: KnnOptions) => {
      const { k, num_candidates, ...restOptions } = options;

      return {
        knn: {
          field: qualifyField(field),
          query_vector: queryVector,
          k,
          num_candidates,
          ...restOptions
        }
      };
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nested: (path: string, fn: (q: any) => any, options?: NestedOptions) => {
      const nestedPath = prefix ? `${prefix}.${path}` : path;
      const nestedQuery = fn(createClauseBuilder(nestedPath));
      return nestedQuery === undefined ? undefined : { nested: { path: nestedPath, query: nestedQuery, ...options } };
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    functionScore: (queryFn: (q: any) => any, options?: FunctionScoreOptions) => {
      const innerQuery = queryFn(createClauseBuilder(prefix)) ?? { match_all: {} };
      return { function_score: { query: innerQuery, ...options } };
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hasChild: (type: string, queryFn: (q: any) => any, options?: HasChildOptions) => {
      const childQuery = queryFn(createClauseBuilder<M>()) ?? { match_all: {} };
      return { has_child: { type, query: childQuery, ...options } };
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hasParent: (type: string, queryFn: (q: any) => any, options?: HasParentOptions) => {
      const parentQuery = queryFn(createClauseBuilder<M>()) ?? { match_all: {} };
      return { has_parent: { parent_type: type, query: parentQuery, ...options } };
    },

    parentId: (type: string, id: string, options?: ParentIdOptions) => ({
      parent_id: { type, id, ...options }
    }),

    when: (condition, thenFn) => (resolveCondition(condition) ? thenFn(createClauseBuilder(prefix)) : undefined)
  };
};

export const createQueryBuilder = <M extends Record<string, FieldTypeString>>(
  state: QueryState<M> = {}
): QueryBuilder<M> => {
  // Internal bool accumulator — during construction we always treat bool.must/filter/etc.
  // as arrays (the Elastic `QueryDslQueryContainer | QueryDslQueryContainer[]` union
  // exists for callers who pass a single clause; the builder never does).
  type BoolAcc = {
    bool?: {
      must?: unknown[];
      must_not?: unknown[];
      should?: unknown[];
      filter?: unknown[];
      minimum_should_match?: number;
    };
  };
  const q = (state.query ?? {}) as BoolAcc;

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...createClauseMethods((dsl: any) => createQueryBuilder<M>({ ...state, query: dsl })),

    // eslint-disable-next-line functional/functional-parameters
    bool: () => createQueryBuilder<M>({ ...state, query: { bool: {} } as QueryDslQueryContainer }),

    must: (builderFn) => {
      const clause = builderFn(createClauseBuilder<M>());
      const existing = q.bool?.must ?? [];
      return clause === undefined
        ? createQueryBuilder<M>(state)
        : createQueryBuilder<M>({
            ...state,
            query: { bool: { ...q.bool, must: [...existing, clause] } } as QueryDslQueryContainer
          });
    },

    mustNot: (builderFn) => {
      const clause = builderFn(createClauseBuilder<M>());
      const existing = q.bool?.must_not ?? [];
      return clause === undefined
        ? createQueryBuilder<M>(state)
        : createQueryBuilder<M>({
            ...state,
            query: { bool: { ...q.bool, must_not: [...existing, clause] } } as QueryDslQueryContainer
          });
    },

    should: (builderFn) => {
      const clause = builderFn(createClauseBuilder<M>());
      const existing = q.bool?.should ?? [];
      return clause === undefined
        ? createQueryBuilder<M>(state)
        : createQueryBuilder<M>({
            ...state,
            query: { bool: { ...q.bool, should: [...existing, clause] } } as QueryDslQueryContainer
          });
    },

    filter: (builderFn) => {
      const clause = builderFn(createClauseBuilder<M>());
      const existing = q.bool?.filter ?? [];
      return clause === undefined
        ? createQueryBuilder<M>(state)
        : createQueryBuilder<M>({
            ...state,
            query: { bool: { ...q.bool, filter: [...existing, clause] } } as QueryDslQueryContainer
          });
    },

    minimumShouldMatch: (value) =>
      createQueryBuilder<M>({
        ...state,
        query: { bool: { ...q.bool, minimum_should_match: value } } as QueryDslQueryContainer
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
          ...restOptions
        }
      });
    },

    nested: (path, fn, options) => {
      const nestedQuery = fn(createClauseBuilder<SubFieldsOf<M, typeof path>>(path));
      return nestedQuery === undefined
        ? createQueryBuilder<M>(state)
        : createQueryBuilder<M>({
            ...state,
            query: { nested: { path, query: nestedQuery, ...options } }
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

    functionScore: (queryFn, options) => {
      const innerQuery = queryFn(createClauseBuilder<M>()) ?? { match_all: {} };
      return createQueryBuilder<M>({
        ...state,
        query: { function_score: { query: innerQuery, ...options } }
      });
    },

    hasChild: (type, queryFn, options) => {
      const childQuery = queryFn(createClauseBuilder<M>()) ?? { match_all: {} };
      return createQueryBuilder<M>({
        ...state,
        query: { has_child: { type, query: childQuery, ...options } }
      });
    },

    hasParent: (type, queryFn, options) => {
      const parentQuery = queryFn(createClauseBuilder<M>()) ?? { match_all: {} };
      return createQueryBuilder<M>({
        ...state,
        query: { has_parent: { parent_type: type, query: parentQuery, ...options } }
      });
    },

    parentId: (type, id, options) =>
      createQueryBuilder<M>({ ...state, query: { parent_id: { type, id, ...options } } }),

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

    sourceIncludes: (paths) => createQueryBuilder<M>({ ...state, _source_includes: paths }),

    sourceExcludes: (paths) => createQueryBuilder<M>({ ...state, _source_excludes: paths }),

    runtimeMappings: (runtime_mappings) => createQueryBuilder<M>({ ...state, runtime_mappings }),

    docValueFields: (docvalue_fields) => createQueryBuilder<M>({ ...state, docvalue_fields }),

    fields: (fields) => createQueryBuilder<M>({ ...state, fields }),

    postFilter: (fn) => {
      const clause = fn(createClauseBuilder<M>());
      return clause === undefined
        ? createQueryBuilder<M>(state)
        : createQueryBuilder<M>({ ...state, post_filter: clause });
    },

    scriptFields: (script_fields) => createQueryBuilder<M>({ ...state, script_fields }),

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
      const highlightFields: Record<string, HighlightOptions> = Object.fromEntries(
        fields.map((field) => [field, fieldValue])
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

    constantScore: (fn, options) => {
      const clause = fn(createClauseBuilder<M>());
      return createQueryBuilder<M>({
        ...state,
        query: {
          constant_score: {
            filter: clause,
            ...options
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
          ...options
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
            ...options
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
  };
};
