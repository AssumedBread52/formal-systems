import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { SignInPayload } from '@/auth/types';

export const signInUser = (builder: EndpointBuilder<BaseQueryFn, never, 'auth'>): MutationDefinition<SignInPayload, BaseQueryFn, never, boolean, 'auth'> => {
  return builder.mutation({
    query: (signInPayload: SignInPayload): FetchArgs => {
      return {
        url: '/login',
        method: 'POST',
        body: signInPayload
      };
    }
  });
};
