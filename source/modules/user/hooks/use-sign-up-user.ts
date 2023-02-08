import { useSignInUserMutation } from '@/auth/hooks';
import { SignUpPayload } from '@/user/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSignUpUserMutation } from './use-sign-up-user-mutation';

export const useSignUpUser = (email: string, password: string): {
  signUpUser: MutationTrigger<MutationDefinition<SignUpPayload, BaseQueryFn, 'session-user', void, 'api'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const router = useRouter();

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

  useEffect((): void => {
    if (isSuccessSignIn) {
      router.back();
    }
  }, [isSuccessSignIn, router]);

  const errorMessage = isErrorSignIn ? 'Failed to sign in.' : (isErrorSignUp ? 'Failed to sign up.' : '');

  return {
    signUpUser,
    errorMessage,
    isLoading: isLoadingSignUp || (isSuccessSignUp && !isErrorSignIn)
  };
};
