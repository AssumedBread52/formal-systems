import { IdPayload } from '@/system/types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition, TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const deleteSystem = (builder: EndpointBuilder<BaseQueryFn, 'system', 'system'>): MutationDefinition<string, BaseQueryFn, 'system', IdPayload, 'system'> => {
  return builder.mutation<IdPayload, string>({
    query: (id: string): FetchArgs => {
      return {
        url: `/${id}`,
        method: 'DELETE'
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
