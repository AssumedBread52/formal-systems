import { QueryResult } from 'typeorm';

export const buildQueryResult = (payload: Object[]): QueryResult => {
  const queryResult = new QueryResult<Object>();

  queryResult.raw = payload;
  queryResult.records = payload;

  return queryResult;
};
