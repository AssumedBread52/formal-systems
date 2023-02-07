import { SignUpPayload } from '@/user/types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const signUpUser = (builder: EndpointBuilder<BaseQueryFn, 'session-user', 'api'>): MutationDefinition<SignUpPayload, BaseQueryFn, 'session-user', void, 'api'> => {
  return builder.mutation<void, SignUpPayload>({
    query: (userData: SignUpPayload): FetchArgs => {
      return {
        url: '/user/create',
        method: 'POST',
        body: userData
      };
    },
    invalidatesTags: ['session-user']
  });
};
