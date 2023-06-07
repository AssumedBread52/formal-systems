import { api } from '@/app/api';

const { useGetSessionUserIdQuery } = api;

export const useIsAuthorized = (userId?: string): boolean => {
  const { data, isSuccess } = useGetSessionUserIdQuery();

  if (!isSuccess) {
    return false;
  }

  const { id } = data;

  return !userId || id === userId;
};
