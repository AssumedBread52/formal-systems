import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';

const { useSignOutMutation } = api;

export const useSignOut = (): [MutationTrigger<MutationDefinition<void, BaseQueryFn, TagTypes, void, 'api'>>, boolean, string] => {
  const [signOut, { isError, isLoading, isSuccess }] = useSignOutMutation();

  useRouteBack(isSuccess);

  return [signOut, isLoading, isError ? 'Failed to sign out.' : ''];
};
