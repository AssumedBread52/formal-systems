import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useRouteOnSuccess } from './use-route-on-success';
import { useSignOutUserMutation } from './use-sign-out-user-mutation';

export const useSignOutUser = (): {
  signOutUser: MutationTrigger<MutationDefinition<void, BaseQueryFn, 'auth', void, 'auth'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const [signOutUser, { isError, isLoading, isSuccess }] = useSignOutUserMutation();

  useRouteOnSuccess(isSuccess);

  return {
    signOutUser,
    errorMessage: isError ? 'Failed to sign up.' : '',
    isLoading
  };
};
