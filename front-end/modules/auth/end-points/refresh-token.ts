import { TagTypes } from '@/app/types/tag-types';
import { TokenPayload } from '@/auth/types/token-payload';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const refreshToken = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<void, BaseQueryFn, TagTypes, TokenPayload, 'api'> => {
  return builder.mutation<TokenPayload, void>({
    query: (): FetchArgs => {
      return {
        method: 'POST',
        url: '/auth/refresh-token'
      };
    }
  });
};
