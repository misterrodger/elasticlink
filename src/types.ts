/* eslint-disable @typescript-eslint/no-explicit-any */
export type QueryState = {
  query?: any;
};

export type ClauseBuilder<T> = {
  matchAll: () => any;
  match: <K extends keyof T>(field: K, value: T[K]) => any;
  multiMatch: <K extends keyof T>(fields: K[], value: string) => any;
  matchPhrase: <K extends keyof T>(field: K, value: T[K]) => any;
  term: <K extends keyof T>(field: K, value: T[K]) => any;
  terms: <K extends keyof T>(field: K, value: T[K]) => any;
  range: <K extends keyof T>(
    field: K,
    conditions: { gte?: T[K]; lte?: T[K]; gt?: T[K]; lt?: T[K] }
  ) => any;
  exists: <K extends keyof T>(field: K) => any;
  prefix: <K extends keyof T>(field: K, value: string) => any;
  wildcard: <K extends keyof T>(field: K, value: string) => any;
};

export type QueryBuilder<T> = {
  bool: () => QueryBuilder<T>;

  must: (fn: (q: ClauseBuilder<T>) => any) => QueryBuilder<T>;
  mustNot: (fn: (q: ClauseBuilder<T>) => any) => QueryBuilder<T>;
  should: (fn: (q: ClauseBuilder<T>) => any) => QueryBuilder<T>;
  filter: (fn: (q: ClauseBuilder<T>) => any) => QueryBuilder<T>;
  minimumShouldMatch: (n: number) => QueryBuilder<T>;

  // Full-text queries
  matchAll: () => QueryBuilder<T>;
  match: <K extends keyof T>(field: K, value: T[K]) => QueryBuilder<T>;
  multiMatch: <K extends keyof T>(fields: K[], value: string) => QueryBuilder<T>;
  matchPhrase: <K extends keyof T>(field: K, value: T[K]) => QueryBuilder<T>;
  // queryString TBD

  // Term-level queries
  term: <K extends keyof T>(field: K, value: T[K]) => QueryBuilder<T>;
  terms: <K extends keyof T>(field: K, values: T[K][]) => QueryBuilder<T>;
  range: <K extends keyof T>(
    field: K,
    conditions: { gte?: T[K]; lte?: T[K]; gt?: T[K]; lt?: T[K] }
  ) => QueryBuilder<T>;
  exists: (field: keyof T) => QueryBuilder<T>;
  prefix: <K extends keyof T>(field: K, value: string) => QueryBuilder<T>;
  wildcard: <K extends keyof T>(field: K, value: string) => QueryBuilder<T>;

  // Conditionals
  // when: (condition: any, builder: QueryBuilder<T>) => QueryBuilder<T>;

  // agg: TBD

  // Meta
  // sort: (field: keyof T, direction: 'asc' | 'desc') => QueryBuilder<T>;
  // from: (from: number) => QueryBuilder<T>;
  // to: (to: number) => QueryBuilder<T>;
  // size: (size: number) => QueryBuilder<T>;
  // source: (fields: (keyof T)[]) => QueryBuilder<T>;

  build: () => QueryState;
};
