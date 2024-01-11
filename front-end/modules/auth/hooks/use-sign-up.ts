import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { SignUpPayload } from '@/auth/types/sign-up-payload';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/query';

const { useSignUpMutation } = api;

export const useSignUp = (): [MutationTrigger<MutationDefinition<SignUpPayload, BaseQueryFn, TagTypes, void, 'api'>>, boolean, boolean] => {
  const [signUp, { isError, isLoading, isSuccess }] = useSignUpMutation();

  useRouteBack(isSuccess);

  return [signUp, isLoading, isError];
};
