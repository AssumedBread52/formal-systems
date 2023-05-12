import { NewSystemPayload } from '@/system/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useCreateSystemMutation } from './use-create-system-mutation';
import { useRouteOnSuccess } from './use-route-on-success';

export const useCreateSystem = (): {
  createSystem: MutationTrigger<MutationDefinition<NewSystemPayload, BaseQueryFn, 'system', void, 'system'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const [createSystem, { isError, isLoading, isSuccess }] = useCreateSystemMutation();

  useRouteOnSuccess(isSuccess);

  return {
    createSystem,
    errorMessage: isError ? 'Failed to create system.' : '',
    isLoading
  };
};
