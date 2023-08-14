import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { IdPayload } from '@/common/types/id-payload';
import { System } from '@/system/types/system';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition, TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const deleteSystem = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<Pick<System, 'id'>, BaseQueryFn, TagTypes, IdPayload, 'api'> => {
  return builder.mutation<IdPayload, Pick<System, 'id'>>({
    invalidatesTags: (result?: IdPayload): TagDescription<TagTypes>[] => {
      if (!result) {
        return [];
      }

      const { id } = result;

      return [
        {
          id,
          type: Tags.System
        },
        Tags.System
      ];
    },
    query: (deletePayload: Pick<System, 'id'>): FetchArgs => {
      const { id } = deletePayload;

      return {
        method: 'DELETE',
        url: `/system/${id}`
      };
    }
  });
};
