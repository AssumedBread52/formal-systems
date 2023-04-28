import { SignInPayload, TokenPayload } from '@/auth/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useRouteOnSuccess } from './use-route-on-success';
import { useSignInUserMutation } from './use-sign-in-user-mutation';

export const useSignInUser = (): {
  signInUser: MutationTrigger<MutationDefinition<SignInPayload, BaseQueryFn, 'auth', TokenPayload, 'auth'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const [signInUser, { isError, isLoading, isSuccess }] = useSignInUserMutation();

  useRouteOnSuccess(isSuccess);

  return {
    signInUser,
    errorMessage: isError ? 'Failed to sign in.' : '',
    isLoading
  };
};
