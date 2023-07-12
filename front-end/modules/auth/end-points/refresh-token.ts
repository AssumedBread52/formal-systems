import { TagTypes } from '@/app/types/tag-types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const refreshToken = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<void, BaseQueryFn, TagTypes, void, 'api'> => {
  return builder.mutation<void, void>({
    query: (): FetchArgs => {
      return {
        method: 'POST',
        url: '/auth/refresh-token'
      };
    }
  });
};
