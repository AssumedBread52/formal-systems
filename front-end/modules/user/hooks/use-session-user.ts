import { api } from '@/app/api';
import { User } from '@/user/types/user';

const { useGetSessionUserQuery } = api;

export const useSessionUser = (): [User | undefined, boolean] => {
  const { data, isLoading, isUninitialized } = useGetSessionUserQuery();

  return [data, isLoading || isUninitialized];
};
