import { useReadUserByIdQuery } from "./use-read-user-by-id-query";

export const useReadUserById = (userId: string) => {
  const { data, isError, isSuccess } = useReadUserByIdQuery(userId);

  return {
    data,
    loading: !isError && !isSuccess
  };
};