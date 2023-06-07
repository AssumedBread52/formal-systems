import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const signOut = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<void, BaseQueryFn, TagTypes, void, 'api'> => {
  return builder.mutation<void, void>({
    invalidatesTags: [Tags.SessionUserId],
    query: (): FetchArgs => {
      return {
        method: 'POST',
        url: '/auth/sign-out'
      };
    }
  });
};
