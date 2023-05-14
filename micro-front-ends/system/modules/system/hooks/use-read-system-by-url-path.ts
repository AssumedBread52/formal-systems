import { ClientSystem } from '@/system/types';
import { useReadSystemByUrlPathQuery } from './use-read-system-by-url-path-query';

export const useReadSystemByUrlPath = (urlPath: string, skip?: boolean): {
  data?: ClientSystem;
  errorMessage: string;
  loading: boolean;
} => {
  const { data, isError, isSuccess } = useReadSystemByUrlPathQuery(urlPath, {
    skip
  });

  return {
    data,
    errorMessage: isError ? 'Failed to read system.' : '',
    loading: !isError && !isSuccess
  };
};
