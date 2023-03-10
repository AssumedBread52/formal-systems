import { TagTypes } from '@/app/types';
import { useSuccessfulRoute } from '@/common/hooks';
import { NewFormalSystemPayload } from '@/formal-system/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useCreateFormalSystemMutation } from './use-create-formal-system-mutation';

export const useCreateFormalSystem = (): {
  createFormalSystem: MutationTrigger<MutationDefinition<NewFormalSystemPayload, BaseQueryFn, TagTypes, void, 'api'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const [createFormalSystem, { isError, isLoading, isSuccess }] = useCreateFormalSystemMutation();

  useSuccessfulRoute(isSuccess);

  return {
    createFormalSystem,
    errorMessage: isError ? 'Failed to create formal system.' : '',
    isLoading
  };
};
