import { CredentialsPayload } from '@/auth/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { signIn } from 'next-auth/react';

export const signInUser = (builder: EndpointBuilder<BaseQueryFn, '', 'api'>): MutationDefinition<CredentialsPayload, BaseQueryFn, '', boolean, 'api'> => {
  return builder.mutation<boolean, CredentialsPayload>({
    queryFn: async (arg: CredentialsPayload): Promise<QueryReturnValue<boolean>> => {
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
          data: true
        };
      } catch {
        return {
          error: 'Client-side catch.'
        };
      }
    }
  });
};
