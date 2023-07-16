import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { IdPayload } from '@/common/types/id-payload';
import { DeleteSymbolPayload } from '@/symbol/types/delete-symbol-payload';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';

const { useDeleteSymbolMutation } = api;

export const useDeleteSymbol = (): [MutationTrigger<MutationDefinition<DeleteSymbolPayload, BaseQueryFn, TagTypes, IdPayload, 'api'>>, boolean, boolean] => {
  const [deleteSymbol, { isError, isLoading, isSuccess }] = useDeleteSymbolMutation();

  useRouteBack(isSuccess);

  return [deleteSymbol, isLoading, isError];
};
