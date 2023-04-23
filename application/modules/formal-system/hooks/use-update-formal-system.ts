import { TagTypes } from '@/app/types';
import { useSuccessfulRoute } from '@/common/hooks';
import { IdResponse } from '@/common/types';
import { UpdateFormalSystemPayload } from '@/formal-system/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useUpdateFormalSystemMutation } from './use-update-formal-system-mutation';

export const useUpdateFormalSystem = (): {
  updateFormalSystem: MutationTrigger<MutationDefinition<UpdateFormalSystemPayload, BaseQueryFn, TagTypes, IdResponse, 'api'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const [updateFormalSystem, { isError, isLoading, isSuccess }] = useUpdateFormalSystemMutation();

  useSuccessfulRoute(isSuccess);

  return {
    updateFormalSystem,
    errorMessage: isError ? 'Failed to update formal system.' : '',
    isLoading
  };
};
