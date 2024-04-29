import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { Symbol } from '@/symbol/types/symbol';
import { BaseQueryFn, EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/query';

export const fetchVariableSymbols = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): QueryDefinition<string, BaseQueryFn, TagTypes, Symbol[], 'api'> => {
  return builder.query<Symbol[], string>({
    providesTags: [
      Tags.Symbol
    ],
    query: (systemId: string): string => {
      return `/system/${systemId}/symbol/variable`;
    }
  });
};
