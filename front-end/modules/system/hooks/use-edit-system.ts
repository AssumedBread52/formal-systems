import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { IdPayload } from '@/common/types/id-payload';
import { EditSystemPayload } from '@/system/types/edit-system-payload';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';

const { useEditSystemMutation } = api;

export const useEditSystem = (): [MutationTrigger<MutationDefinition<EditSystemPayload, BaseQueryFn, TagTypes, IdPayload, 'api'>>, boolean, string] => {
  const [editSystem, { isError, isLoading, isSuccess }] = useEditSystemMutation();

  useRouteBack(isSuccess);

  return [editSystem, isLoading, isError ? 'Failed to edit system.' : ''];
};
