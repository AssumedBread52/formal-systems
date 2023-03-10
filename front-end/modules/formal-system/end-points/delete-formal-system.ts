import { TagTypes } from '@/app/types';
import { IdResponse } from '@/common/types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const deleteFormalSystem = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<string, BaseQueryFn, TagTypes, IdResponse, 'api'> => {
  return builder.mutation<IdResponse, string>({
    query: (id: string): FetchArgs => {
      return {
        url: `/formal-system/${id}`,
        method: 'DELETE'
      };
    },
    invalidatesTags: ['formal-system']
  });
};
