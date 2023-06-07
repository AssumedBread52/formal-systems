import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { SignInPayload } from '@/auth/types/sign-in-payload';
import { TokenPayload } from '@/auth/types/token-payload';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const signIn = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<SignInPayload, BaseQueryFn, TagTypes, TokenPayload, 'api'> => {
  return builder.mutation<TokenPayload, SignInPayload>({
    invalidatesTags: [Tags.SessionUserId],
    query: (signInPayload: SignInPayload): FetchArgs => {
      return {
        body: signInPayload,
        method: 'POST',
        url: '/auth/sign-in'
      };
    }
  });
};
