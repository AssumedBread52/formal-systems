import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { Symbol } from '@/symbol/types/symbol';
import { BaseQueryFn, EndpointBuilder, QueryDefinition, TagDescription } from '@reduxjs/toolkit/query';

export const fetchSymbol = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): QueryDefinition<Pick<Symbol, 'id' | 'systemId'>, BaseQueryFn, TagTypes, Symbol, 'api'> => {
  return builder.query<Symbol, Pick<Symbol, 'id' | 'systemId'>>({
    providesTags: (result?: Symbol): readonly TagDescription<TagTypes>[] => {
      if (!result) {
        return [];
      }

      const { id } = result;

      return [
        {
          id,
          type: Tags.Symbol
        }
      ];
    },
    query: (queryArgs: Pick<Symbol, 'id' | 'systemId'>): string => {
      const { id, systemId } = queryArgs;

      return `/system/${systemId}/symbol/${id}`;
    }
  });
};
