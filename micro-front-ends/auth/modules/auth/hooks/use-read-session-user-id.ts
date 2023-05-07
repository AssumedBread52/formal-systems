import { useReadSessionUserIdQuery } from './use-read-session-user-id-query';

export const useReadSessionUserId = (userId?: string): boolean => {
  const { data, isSuccess } = useReadSessionUserIdQuery();

  if (!isSuccess) {
    return false;
  }

  const { id } = data;

  return !userId || id === userId;
};
