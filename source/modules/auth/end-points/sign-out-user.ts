import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { signOut } from 'next-auth/react';

export const signOutUser = (builder: EndpointBuilder<BaseQueryFn, 'session-user', 'api'>): MutationDefinition<void, BaseQueryFn, 'session-user', boolean, 'api'> => {
  return builder.mutation<boolean, void>({
    queryFn: async (): Promise<QueryReturnValue<boolean>> => {
      try {
        await signOut<false>({
          redirect: false
        });

        return {
          data: true
        };
      } catch {
        return {
          error: 'Client-side catch.'
        }
      }
    },
    invalidatesTags: ['session-user']
  })
};
