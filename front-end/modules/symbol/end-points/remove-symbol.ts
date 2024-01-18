import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { IdPayload } from '@/common/types/id-payload';
import { Symbol } from '@/symbol/types/symbol';
import { BaseQueryFn, EndpointBuilder, FetchArgs, MutationDefinition, TagDescription } from '@reduxjs/toolkit/query';

export const removeSymbol = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<Pick<Symbol, 'id' | 'systemId'>, BaseQueryFn, TagTypes, IdPayload, 'api'> => {
  return builder.mutation<IdPayload, Pick<Symbol, 'id' | 'systemId'>>({
    invalidatesTags: (result?: IdPayload): TagDescription<TagTypes>[] => {
      if (!result) {
        return [];
      }

      const { id } = result;

      return [
        {
          id,
          type: Tags.Symbol
        },
        Tags.Symbol
      ];
    },
    query: (removeSymbolPayload: Pick<Symbol, 'id' | 'systemId'>): FetchArgs => {
      const { id, systemId } = removeSymbolPayload;

      return {
        method: 'DELETE',
        url: `/system/${systemId}/symbol/${id}`
      };
    }
  });
};
