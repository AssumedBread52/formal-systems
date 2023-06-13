import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { IdPayload } from '@/common/types/id-payload';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';

const { useDeleteSystemMutation } = api;

export const useDeleteSystem = (): [MutationTrigger<MutationDefinition<string, BaseQueryFn, TagTypes, IdPayload, 'api'>>, boolean, string] => {
  const [deleteSystem, { isError, isLoading, isSuccess }] = useDeleteSystemMutation();

  useRouteBack(isSuccess);

  return [deleteSystem, isLoading, isError ? 'Failed to delete formal system.' : ''];
};
