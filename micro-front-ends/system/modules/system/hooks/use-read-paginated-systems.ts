import { PaginatedResults, PaginationParameters } from '@/system/types';
import { useReadPaginatedSystemsQuery } from './use-read-paginated-systems-query';

export const useReadPaginatedSystems = (paginationParameters: PaginationParameters): {
  data?: PaginatedResults;
  errorMessage: string;
  loading: boolean;
} => {
  const { data, isError, isSuccess } = useReadPaginatedSystemsQuery(paginationParameters);

  return {
    data,
    errorMessage: isError ? 'Failed to read systems.' : '',
    loading: !isError && !isSuccess
  };
};
