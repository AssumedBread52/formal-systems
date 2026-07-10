import { QueryResult } from 'typeorm';

export const buildQueryResult = (payload: Record<string, unknown>[]): QueryResult => {
  const queryResult = new QueryResult<Record<string, unknown>>();

  queryResult.raw = payload;
  queryResult.records = payload;

  return queryResult;
};
