import { QueryState, QueryBuilder, ClauseBuilder } from './types';

const createClauseBuilder = <T>(): ClauseBuilder<T> => ({
  matchAll: () => ({ match_all: {} }),
  match: (field, value) => ({ match: { [field]: value } }),
  multiMatch: (fields, query) => ({ multi_match: { fields, query } }),
  matchPhrase: (field, query) => ({ match_phrase: { [field]: query }}),
  term: (field, value) => ({ term: { [field]: value } }),
  terms: (field, value) => ({ terms: { [field]: value } }),
  range: (field, conditions) => ({ range: { [field]: conditions } }),
  exists: (field) => ({ exists: { field } }),
  prefix: (field, value) => ({ prefix: { [field]: value } }),
  wildcard: (field, value) => ({ wildcard: { [field]: value } })
  // TODO: when conditional
});

const clauseBuilder = createClauseBuilder();

export const createQueryBuilder = <T>(
  state: QueryState = {}
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
  match: (field, value) =>
    createQueryBuilder<T>({ ...state, query: { match: { [field]: value } } }),
  multiMatch: (fields, query) => createQueryBuilder<T>({ ...state, query: { multi_match: { fields, query } } }),
  term: (field, value) =>
    createQueryBuilder<T>({ ...state, query: { term: { [field]: value } } }),
  matchPhrase: (field, value) =>
    createQueryBuilder<T>({ ...state, query: { match_phrase: { [field]: value } } }),
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

  // TODO: when conditional

  range: (field, conditions) =>
    createQueryBuilder({ ...state, query: { range: { [field]: conditions } } }),

  // todo - sort

  // Pagination & source
  // size: (size) => createQueryBuilder({ ...state, size }),
  // from: (from) => createQueryBuilder({ ...state, from }),
  // to: (to) => createQueryBuilder({ ...state, to }),
  // source: (_source) => createQueryBuilder({ ...state, _source }),

  build: () => state
});
