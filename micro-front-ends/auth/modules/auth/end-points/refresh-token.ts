import { TokenPayload } from '@/auth/types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const refreshToken = (builder: EndpointBuilder<BaseQueryFn, 'auth', 'auth'>): MutationDefinition<void, BaseQueryFn, 'auth', TokenPayload, 'auth'> => {
  return builder.mutation<TokenPayload, void>({
    query: (): FetchArgs => {
      return {
        url: '/refresh-token',
        method: 'POST'
      };
    }
  });
};
