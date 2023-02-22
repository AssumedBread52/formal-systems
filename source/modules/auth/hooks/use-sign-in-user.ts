import { CredentialsPayload } from '@/auth/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSignInUserMutation } from './use-sign-in-user-mutation';

export const useSignInUser = (): {
  signInUser: MutationTrigger<MutationDefinition<CredentialsPayload, BaseQueryFn, '', boolean, 'api'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const { back } = useRouter();

  const [signInUser, { isError, isLoading, isSuccess }] = useSignInUserMutation();

  useEffect((): void => {
    if (isSuccess) {
      back();
    }
  }, [isSuccess, back]);

  return {
    signInUser,
    errorMessage: isError ? 'Failed to sign in.' : '',
    isLoading
  };
};
