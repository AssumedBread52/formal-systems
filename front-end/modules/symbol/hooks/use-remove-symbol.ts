import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { IdPayload } from '@/common/types/id-payload';
import { Symbol } from '@/symbol/types/symbol';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/query';

const { useRemoveSymbolMutation } = api;

export const useRemoveSymbol = (): [MutationTrigger<MutationDefinition<Pick<Symbol, 'id' | 'systemId'>, BaseQueryFn, TagTypes, IdPayload, 'api'>>, boolean, boolean] => {
  const [removeSymbol, { isError, isLoading, isSuccess }] = useRemoveSymbolMutation();

  useRouteBack(isSuccess);

  return [removeSymbol, isLoading, isError];
};
