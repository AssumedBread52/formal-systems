import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { SignUpPayload } from '@/auth/types/sign-up-payload';
import { TokenPayload } from '@/auth/types/token-payload';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';

const { useSignUpMutation } = api;

export const useSignUp = (): [MutationTrigger<MutationDefinition<SignUpPayload, BaseQueryFn, TagTypes, TokenPayload, 'api'>>, boolean, string] => {
  const [signUp, { isError, isLoading, isSuccess }] = useSignUpMutation();

  useRouteBack(isSuccess);

  return [signUp, isLoading, isError ? 'Failed to sign up.' : ''];
};
