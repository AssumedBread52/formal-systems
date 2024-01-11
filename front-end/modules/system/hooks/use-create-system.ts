import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { NewSystemPayload } from '@/system/types/new-system-payload';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/query';

const { useCreateSystemMutation } = api;

export const useCreateSystem = (): [MutationTrigger<MutationDefinition<NewSystemPayload, BaseQueryFn, TagTypes, void, 'api'>>, boolean, boolean] => {
  const [createSystem, { isError, isLoading, isSuccess }] = useCreateSystemMutation();

  useRouteBack(isSuccess);

  return [createSystem, isLoading, isError];
};
