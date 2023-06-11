import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { NewSystemPayload } from '@/system/types/new-system-payload';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';

const { useCreateSystemMutation } = api;

export const useCreateSystem = (): [MutationTrigger<MutationDefinition<NewSystemPayload, BaseQueryFn, TagTypes, void, 'api'>>, boolean, string] => {
  const [createSystem, { isError, isLoading, isSuccess }] = useCreateSystemMutation();

  useRouteBack(isSuccess);

  return [createSystem, isLoading, isError ? 'Failed to create system.' : ''];
};
