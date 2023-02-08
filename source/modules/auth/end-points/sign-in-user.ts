import { CredentialsPayload } from '@/auth/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { signIn } from 'next-auth/react';

export const signInUser = (builder: EndpointBuilder<BaseQueryFn, 'session-user', 'api'>): MutationDefinition<CredentialsPayload, BaseQueryFn, 'session-user', void, 'api'> => {
  return builder.mutation<void, CredentialsPayload>({
    queryFn: async (arg: CredentialsPayload): Promise<QueryReturnValue<void>> => {
      try {
        const { email, password } = arg;

        const response = await signIn<'credentials'>('credentials', {
          redirect: false,
          email,
          password
        });

        if (response && (!response.ok || response.error)) {
          return {
            error: 'Response indicates error.'
          };
        }

        return {
          data: undefined
        };
      } catch {
        return {
          error: 'Client-side catch.'
        };
      }
    },
    invalidatesTags: ['session-user']
  });
};
