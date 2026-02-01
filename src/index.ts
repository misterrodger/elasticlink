import { createQueryBuilder } from './query-builder';
import { createAggregationBuilder } from './aggregation-builder';

export const query = <T>(includeQuery: boolean = true) =>
  createQueryBuilder<T>({ _includeQuery: includeQuery });
export const aggregations = <T>() => createAggregationBuilder<T>();
