import { SignInPayload, TokenPayload } from '@/auth/types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const signInUser = (builder: EndpointBuilder<BaseQueryFn, 'auth', 'auth'>): MutationDefinition<SignInPayload, BaseQueryFn, 'auth', TokenPayload, 'auth'> => {
  return builder.mutation<TokenPayload, SignInPayload>({
    query: (signInPayload: SignInPayload): FetchArgs => {
      return {
        url: '/login',
        method: 'POST',
        body: signInPayload
      };
    }
  });
};
