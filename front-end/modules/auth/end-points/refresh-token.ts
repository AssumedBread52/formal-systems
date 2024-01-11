import { TagTypes } from '@/app/types/tag-types';
import { BaseQueryFn, EndpointBuilder, FetchArgs, MutationDefinition } from '@reduxjs/toolkit/query';

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
