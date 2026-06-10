import { QueryResult } from 'typeorm';

export const buildQueryResult = (payload: any[]): QueryResult => {
  const queryResult = new QueryResult();

  queryResult.raw = payload;
  queryResult.records = payload;

  return queryResult
};
