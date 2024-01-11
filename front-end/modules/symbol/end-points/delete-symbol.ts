import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { IdPayload } from '@/common/types/id-payload';
import { DeleteSymbolPayload } from '@/symbol/types/delete-symbol-payload';
import { BaseQueryFn, EndpointBuilder, FetchArgs, MutationDefinition, TagDescription } from '@reduxjs/toolkit/query';

export const deleteSymbol = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<DeleteSymbolPayload, BaseQueryFn, TagTypes, IdPayload, 'api'> => {
  return builder.mutation<IdPayload, DeleteSymbolPayload>({
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
    query: (deleteSymbolPayload: DeleteSymbolPayload): FetchArgs => {
      const { id, systemId } = deleteSymbolPayload;

      return {
        method: 'DELETE',
        url: `/system/${systemId}/symbol/${id}`
      };
    }
  });
};
