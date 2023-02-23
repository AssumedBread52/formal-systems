import { TagTypes } from '@/app/types';
import { useSuccessfulRoute } from '@/common/hooks';
import { DeleteByIdPayload, IdResponse } from '@/common/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useDeleteFormalSystemMutation } from './use-delete-formal-system-mutation';

export const useDeleteFormalSystem = (): {
  deleteFormalSystem: MutationTrigger<MutationDefinition<DeleteByIdPayload, BaseQueryFn, TagTypes, IdResponse, 'api'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const [deleteFormalSystem, { isError, isLoading, isSuccess }] = useDeleteFormalSystemMutation();

  useSuccessfulRoute(isSuccess);

  return {
    deleteFormalSystem,
    errorMessage: isError ? 'Failed to delete formal system.' : '',
    isLoading
  };
};
