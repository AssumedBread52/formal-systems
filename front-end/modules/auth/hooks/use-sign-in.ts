import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { SignInPayload } from '@/auth/types/sign-in-payload';
import { TokenPayload } from '@/auth/types/token-payload';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';

const { useSignInMutation } = api;

export const useSignIn = (): [MutationTrigger<MutationDefinition<SignInPayload, BaseQueryFn, TagTypes, TokenPayload, 'api'>>, boolean, string] => {
  const [signIn, { isError, isLoading, isSuccess }] = useSignInMutation();

  useRouteBack(isSuccess);

  return [signIn, isLoading, isError ? 'Failed to sign in.' : ''];
};