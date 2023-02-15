import { CredentialsPayload } from '@/auth/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSignInUserMutation } from './use-sign-in-user-mutation';

export const useSignInUser = (): [MutationTrigger<MutationDefinition<CredentialsPayload, BaseQueryFn, '', boolean, 'api'>>, boolean, boolean] => {
  const router = useRouter();

  const [signInUser, { isError, isLoading, isSuccess }] = useSignInUserMutation();

  useEffect((): void => {
    if (isSuccess) {
      router.back();
    }
  }, [isSuccess, router]);

  return [signInUser, isError, isLoading];
};
