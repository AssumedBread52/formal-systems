import { api } from '@/app/api';
import { User } from '@/user/types/user';

const { useGetUserByIdQuery } = api;

export const useGetUserById = (userId: string): [User | undefined, boolean] => {
  const { data, isLoading, isUninitialized } = useGetUserByIdQuery(userId);

  return [data, isLoading || isUninitialized];
};
