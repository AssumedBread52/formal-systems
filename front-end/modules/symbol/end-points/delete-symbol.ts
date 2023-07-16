import { TagTypes } from '@/app/types/tag-types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition, TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { Symbol } from '@/symbol/types/symbol';
import { IdPayload } from '@/common/types/id-payload';
import { Tags } from '@/app/constants/tags';

export const deleteSymbol = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<Pick<Symbol, 'id' | 'systemId'>, BaseQueryFn, TagTypes, IdPayload, 'api'> => {
  return builder.mutation<IdPayload, Pick<Symbol, 'id' | 'systemId'>>({
    invalidatesTags: (result?: IdPayload): TagDescription<TagTypes>[] => {
      if (!result) {
        return [];
      }

      const { id } = result;

      return [
        Tags.Symbol,
        {
          type: Tags.Symbol,
          id
        }
      ];
    },
    query: (idPayload: Pick<Symbol, 'id' | 'systemId'>): FetchArgs => {
      const { id, systemId } = idPayload;

      return {
        method: 'DELETE',
        url: `/system/${systemId}/symbol/${id}`
      };
    }
  });
};
