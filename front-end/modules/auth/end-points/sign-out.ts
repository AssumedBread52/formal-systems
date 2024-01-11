import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { BaseQueryFn, EndpointBuilder, FetchArgs, MutationDefinition } from '@reduxjs/toolkit/query';

export const signOut = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<void, BaseQueryFn, TagTypes, void, 'api'> => {
  return builder.mutation<void, void>({
    invalidatesTags: [
      Tags.SessionUser
    ],
    query: (): FetchArgs => {
      return {
        method: 'POST',
        url: '/auth/sign-out'
      };
    }
  });
};
