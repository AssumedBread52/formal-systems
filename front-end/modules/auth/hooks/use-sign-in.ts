import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { SignInPayload } from '@/auth/types/sign-in-payload';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/query';

const { useSignInMutation } = api;

export const useSignIn = (): [MutationTrigger<MutationDefinition<SignInPayload, BaseQueryFn, TagTypes, void, 'api'>>, boolean, boolean] => {
  const [signIn, { isError, isLoading, isSuccess }] = useSignInMutation();

  useRouteBack(isSuccess);

  return [signIn, isLoading, isError];
};
