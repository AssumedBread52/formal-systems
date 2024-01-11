import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/query';

const { useSignOutMutation } = api;

export const useSignOut = (): [MutationTrigger<MutationDefinition<void, BaseQueryFn, TagTypes, void, 'api'>>, boolean, boolean] => {
  const [signOut, { isError, isLoading, isSuccess }] = useSignOutMutation();

  useRouteBack(isSuccess);

  return [signOut, isLoading, isError];
};
