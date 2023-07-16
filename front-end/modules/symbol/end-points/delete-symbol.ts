import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { IdPayload } from '@/common/types/id-payload';
import { DeleteSymbolPayload } from '@/symbol/types/delete-symbol-payload';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition, TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const deleteSymbol = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<DeleteSymbolPayload, BaseQueryFn, TagTypes, IdPayload, 'api'> => {
  return builder.mutation<IdPayload, DeleteSymbolPayload>({
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
    query: (deleteSymbolPayload: DeleteSymbolPayload): FetchArgs => {
      const { id, systemId } = deleteSymbolPayload;

      return {
        method: 'DELETE',
        url: `/system/${systemId}/symbol/${id}`
      };
    }
  });
};
