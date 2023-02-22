import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSignOutUserMutation } from './use-sign-out-user-mutation';

export const useSignOutUser = (): {
  signOutUser: MutationTrigger<MutationDefinition<void, BaseQueryFn, '', boolean, 'api'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const { push } = useRouter();

  const [signOutUser, { isError, isLoading, isSuccess }] = useSignOutUserMutation();

  useEffect((): void => {
    if (isSuccess) {
      push('/');
    }
  }, [isSuccess, push]);

  return {
    signOutUser,
    errorMessage: isError ? 'Failed to sign out.' : '',
    isLoading
  };
};
