import { TagTypes } from '@/app/types';
import { useSignInUserMutation } from '@/auth/hooks';
import { useSuccessfulRoute } from '@/common/hooks';
import { SignUpPayload } from '@/user/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useEffect } from 'react';
import { useSignUpUserMutation } from './use-sign-up-user-mutation';

export const useSignUpUser = (email: string, password: string): {
  signUpUser: MutationTrigger<MutationDefinition<SignUpPayload, BaseQueryFn, TagTypes, void, 'api'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const [signUpUser, { isError: isErrorSignUp, isLoading: isLoadingSignUp, isSuccess: isSuccessSignUp }] = useSignUpUserMutation();
  const [signInUser, { isError: isErrorSignIn, isSuccess: isSuccessSignIn }] = useSignInUserMutation();

  useEffect((): void => {
    if (isSuccessSignUp) {
      signInUser({
        email,
        password
      });
    }
  }, [isSuccessSignUp, email, password, signInUser]);

  useSuccessfulRoute(isSuccessSignIn);

  const errorMessage = isErrorSignIn ? 'Failed to sign in.' : (isErrorSignUp ? 'Failed to sign up.' : '');

  return {
    signUpUser,
    errorMessage,
    isLoading: isLoadingSignUp || (isSuccessSignUp && !isErrorSignIn)
  };
};
