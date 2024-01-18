import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { NewSystemPayload } from '@/system/types/new-system-payload';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/query';

const { useAddSystemMutation } = api;

export const useAddSystem = (): [MutationTrigger<MutationDefinition<NewSystemPayload, BaseQueryFn, TagTypes, void, 'api'>>, boolean, boolean] => {
  const [addSystem, { isError, isLoading, isSuccess }] = useAddSystemMutation();

  useRouteBack(isSuccess);

  return [addSystem, isLoading, isError];
};
