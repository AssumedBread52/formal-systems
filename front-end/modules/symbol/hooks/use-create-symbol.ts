import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { NewSymbolPayload } from '@/symbol/types/new-symbol-payload';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';

const { useCreateSymbolMutation } = api;

export const useCreateSymbol = (): [MutationTrigger<MutationDefinition<NewSymbolPayload, BaseQueryFn, TagTypes, void, 'api'>>, boolean, boolean] => {
  const [createSymbol, { isError, isLoading, isSuccess }] = useCreateSymbolMutation();

  useRouteBack(isSuccess);

  return [createSymbol, isLoading, isError];
};
