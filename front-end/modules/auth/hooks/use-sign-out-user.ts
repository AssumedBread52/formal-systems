import { TagTypes } from '@/app/types';
import { useSuccessfulRoute } from '@/common/hooks';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useSignOutUserMutation } from './use-sign-out-user-mutation';

export const useSignOutUser = (): {
  signOutUser: MutationTrigger<MutationDefinition<void, BaseQueryFn, TagTypes, boolean, 'api'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const [signOutUser, { isError, isLoading, isSuccess }] = useSignOutUserMutation();

  useSuccessfulRoute(isSuccess);

  return {
    signOutUser,
    errorMessage: isError ? 'Failed to sign out.' : '',
    isLoading
  };
};
