import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { SignUpPayload } from '@/auth/types/sign-up-payload';
import { TokenPayload } from '@/auth/types/token-payload';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const signUp = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<SignUpPayload, BaseQueryFn, TagTypes, TokenPayload, 'api'> => {
  return builder.mutation<TokenPayload, SignUpPayload>({
    invalidatesTags: [Tags.SessionUserId],
    query: (signUpPayload: SignUpPayload): FetchArgs => {
      return {
        body: signUpPayload,
        method: 'POST',
        url: '/auth/sign-up'
      };
    }
  });
};