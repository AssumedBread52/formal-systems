import { ClientUser } from '@/user/types';
import { useReadUserByIdQuery } from './use-read-user-by-id-query';

export const useReadUserById = (userId: string): {
  data?: ClientUser;
  loading: boolean;
} => {
  const { data, isError, isSuccess } = useReadUserByIdQuery(userId);

  return {
    data,
    loading: !isError && !isSuccess
  };
};