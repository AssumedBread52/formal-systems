import { api } from '@/app/api';
import { System } from '@/system/types/system';

const { useGetSystemByUrlPathQuery } = api;

export const useGetSystemByUrlPath = (urlPath: string): [System | undefined, boolean] => {
  const { data, isLoading, isUninitialized } = useGetSystemByUrlPathQuery(urlPath);

  return [data, isLoading || isUninitialized];
};
