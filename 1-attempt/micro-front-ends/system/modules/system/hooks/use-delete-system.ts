import { IdPayload } from '@/system/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useDeleteSystemMutation } from './use-delete-system-mutation';
import { useRouteOnSuccess } from './use-route-on-success';

export const useDeleteSystem = (): {
  deleteSystem: MutationTrigger<MutationDefinition<string, BaseQueryFn, 'system', IdPayload, 'system'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const [deleteSystem, { isError, isLoading, isSuccess }] = useDeleteSystemMutation();

  useRouteOnSuccess(isSuccess);

  return {
    deleteSystem,
    errorMessage: isError ? 'Failed to delete system.' : '',
    isLoading
  };
};
