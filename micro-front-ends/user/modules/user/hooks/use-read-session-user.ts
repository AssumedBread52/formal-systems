import { ClientUser } from '@/user/types';
import { useReadSessionUserQuery } from './use-read-session-user-query';

export const useReadSessionUser = (): {
  data?: ClientUser;
  loading: boolean;
} => {
  const { data, isError, isSuccess } = useReadSessionUserQuery();

  return {
    data,
    loading: !isError && !isSuccess
  };
};
