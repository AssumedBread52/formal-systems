import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { NewSymbolPayload } from '@/symbol/types/new-symbol-payload';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/query';

const { useAddSymbolMutation } = api;

export const useAddSymbol = (): [MutationTrigger<MutationDefinition<NewSymbolPayload, BaseQueryFn, TagTypes, void, 'api'>>, boolean, boolean] => {
  const [addSymbol, { isError, isLoading, isSuccess }] = useAddSymbolMutation();

  useRouteBack(isSuccess);

  return [addSymbol, isLoading, isError];
};
