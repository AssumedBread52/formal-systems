import { TagTypes } from '@/app/types';
import { CredentialsPayload } from '@/auth/types';
import { useSuccessfulRoute } from '@/common/hooks';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useSignInUserMutation } from './use-sign-in-user-mutation';

export const useSignInUser = (): {
  signInUser: MutationTrigger<MutationDefinition<CredentialsPayload, BaseQueryFn, TagTypes, boolean, 'api'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const [signInUser, { isError, isLoading, isSuccess }] = useSignInUserMutation();

  useSuccessfulRoute(isSuccess);

  return {
    signInUser,
    errorMessage: isError ? 'Failed to sign in.' : '',
    isLoading
  };
};
