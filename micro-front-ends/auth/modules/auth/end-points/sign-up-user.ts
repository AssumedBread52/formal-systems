import { SignUpPayload, TokenPayload } from '@/auth/types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const signUpUser = (builder: EndpointBuilder<BaseQueryFn, 'auth', 'auth'>): MutationDefinition<SignUpPayload, BaseQueryFn, 'auth', TokenPayload, 'auth'> => {
  return builder.mutation<TokenPayload, SignUpPayload>({
    query: (signUpPayload: SignUpPayload): FetchArgs => {
      return {
        url: '/sign-up',
        method: 'POST',
        body: signUpPayload
      };
    }
  });
};
