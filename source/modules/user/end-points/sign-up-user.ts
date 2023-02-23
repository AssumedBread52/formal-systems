import { TagTypes } from '@/app/types';
import { SignUpPayload } from '@/user/types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const signUpUser = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<SignUpPayload, BaseQueryFn, TagTypes, void, 'api'> => {
  return builder.mutation<void, SignUpPayload>({
    query: (userData: SignUpPayload): FetchArgs => {
      return {
        url: '/user/create',
        method: 'POST',
        body: userData
      };
    }
  });
};
