import { IdPayload, UpdateSystemPayload } from '@/system/types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition, TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const updateSystem = (builder: EndpointBuilder<BaseQueryFn, 'system', 'system'>): MutationDefinition<UpdateSystemPayload, BaseQueryFn, 'system', IdPayload, 'system'> => {
  return builder.mutation<IdPayload, UpdateSystemPayload>({
    query: (updateSystemPayload: UpdateSystemPayload): FetchArgs => {
      const { id, title, description } = updateSystemPayload;

      return {
        url: `/${id}`,
        method: 'PATCH',
        body: {
          title,
          description
        }
      };
    },
    invalidatesTags: (result?: IdPayload): TagDescription<'system'>[] => {
      if (!result) {
        return [];
      }

      const { id } = result;

      return ['system', { type: 'system', id }];
    }
  });
};
