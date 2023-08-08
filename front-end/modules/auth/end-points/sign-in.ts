import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { SignInPayload } from '@/auth/types/sign-in-payload';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const signIn = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<SignInPayload, BaseQueryFn, TagTypes, void, 'api'> => {
  return builder.mutation<void, SignInPayload>({
    invalidatesTags: [
      Tags.SessionUser
    ],
    query: (signInPayload: SignInPayload): FetchArgs => {
      return {
        body: signInPayload,
        method: 'POST',
        url: '/auth/sign-in'
      };
    }
  });
};
