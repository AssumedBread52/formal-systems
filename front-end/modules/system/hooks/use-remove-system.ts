import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { IdPayload } from '@/common/types/id-payload';
import { System } from '@/system/types/system';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/query';

const { useRemoveSystemMutation } = api;

export const useRemoveSystem = (): [MutationTrigger<MutationDefinition<Pick<System, 'id'>, BaseQueryFn, TagTypes, IdPayload, 'api'>>, boolean, boolean] => {
  const [removeSystem, { isError, isLoading, isSuccess }] = useRemoveSystemMutation();

  useRouteBack(isSuccess);

  return [removeSystem, isLoading, isError];
};
