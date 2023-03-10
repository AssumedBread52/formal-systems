export type PaginatedResults<ResultType> = {
  total: number;
  results: ResultType[];
};
