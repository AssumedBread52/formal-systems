import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { IdPayload } from '@/common/types/id-payload';
import { EditSymbolPayload } from '@/symbol/types/edit-symbol-payload';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/query';

const { useEditSymbolMutation } = api;

export const useEditSymbol = (): [MutationTrigger<MutationDefinition<EditSymbolPayload, BaseQueryFn, TagTypes, IdPayload, 'api'>>, boolean, boolean] => {
  const [editSymbol, { isError, isLoading, isSuccess }] = useEditSymbolMutation();

  useRouteBack(isSuccess);

  return [editSymbol, isLoading, isError];
};
