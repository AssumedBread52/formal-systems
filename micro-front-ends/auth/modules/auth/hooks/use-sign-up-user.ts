import { SignUpPayload, TokenPayload } from '@/auth/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useRouteOnSuccess } from './use-route-on-success';
import { useSignUpUserMutation } from './use-sign-up-user-mutation';

export const useSignUpUser = (): {
  signUpUser: MutationTrigger<MutationDefinition<SignUpPayload, BaseQueryFn, 'auth', TokenPayload, 'auth'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const [signUpUser, { isError, isLoading, isSuccess }] = useSignUpUserMutation();

  useRouteOnSuccess(isSuccess);

  return {
    signUpUser,
    errorMessage: isError ? 'Failed to sign in.' : '',
    isLoading
  };
};
