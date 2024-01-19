import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { IdPayload } from '@/common/types/id-payload';
import { System } from '@/system/types/system';
import { BaseQueryFn, EndpointBuilder, FetchArgs, MutationDefinition, TagDescription } from '@reduxjs/toolkit/query';

export const removeSystem = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<Pick<System, 'id'>, BaseQueryFn, TagTypes, IdPayload, 'api'> => {
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
    query: (removeSystemPayload: Pick<System, 'id'>): FetchArgs => {
      const { id } = removeSystemPayload;

      return {
        method: 'DELETE',
        url: `/system/${id}`
      };
    }
  });
};
