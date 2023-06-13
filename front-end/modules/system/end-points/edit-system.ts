import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { IdPayload } from '@/common/types/id-payload';
import { EditSystemPayload } from '@/system/types/edit-system-payload';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition, TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const editSystem = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<EditSystemPayload, BaseQueryFn, TagTypes, IdPayload, 'api'> => {
  return builder.mutation<IdPayload, EditSystemPayload>({
    invalidatesTags: (result?: IdPayload): TagDescription<TagTypes>[] => {
      if (!result) {
        return [];
      }

      const { id } = result;

      return [
        Tags.System,
        {
          type: Tags.System,
          id
        }
      ];
    },
    query: (editSystemPayload: EditSystemPayload): FetchArgs => {
      const { id, newTitle, newDescription } = editSystemPayload;

      return {
        body: {
          newTitle,
          newDescription
        },
        method: 'PATCH',
        url: `/system/${id}`
      };
    }
  });
};
