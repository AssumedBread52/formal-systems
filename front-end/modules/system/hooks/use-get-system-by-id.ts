import { api } from '@/app/api';
import { System } from '@/system/types/system';

const { useGetSystemByIdQuery } = api;

export const useGetSystemById = (id: string): [System | undefined, boolean] => {
  const { data, isLoading, isUninitialized } = useGetSystemByIdQuery(id);

  return [data, isLoading || isUninitialized];
};
