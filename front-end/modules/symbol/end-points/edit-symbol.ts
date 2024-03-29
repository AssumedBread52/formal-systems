import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { IdPayload } from '@/common/types/id-payload';
import { EditSymbolPayload } from '@/symbol/types/edit-symbol-payload';
import { BaseQueryFn, EndpointBuilder, FetchArgs, MutationDefinition, TagDescription } from '@reduxjs/toolkit/query';

export const editSymbol = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<EditSymbolPayload, BaseQueryFn, TagTypes, IdPayload, 'api'> => {
  return builder.mutation<IdPayload, EditSymbolPayload>({
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
    query: (editSymbolPayload: EditSymbolPayload): FetchArgs => {
      const { id, newTitle, newDescription, newType, newContent, systemId } = editSymbolPayload;

      return {
        body: {
          newTitle,
          newDescription,
          newType,
          newContent
        },
        method: 'PATCH',
        url: `/system/${systemId}/symbol/${id}`
      };
    }
  });
};
