import { IdPayload, UpdateSystemPayload } from '@/system/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useRouteOnSuccess } from './use-route-on-success';
import { useUpdateSystemMutation } from './use-update-system-mutation';

export const useUpdateSystem = (): {
  updateSystem: MutationTrigger<MutationDefinition<UpdateSystemPayload, BaseQueryFn, 'system', IdPayload, 'system'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const [updateSystem, { isError, isLoading, isSuccess }] = useUpdateSystemMutation();

  useRouteOnSuccess(isSuccess);

  return {
    updateSystem,
    errorMessage: isError ? 'Failed to update system.' : '',
    isLoading
  };
};
