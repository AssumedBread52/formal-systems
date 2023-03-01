import { TagTypes } from '@/app/types';
import { IdResponse } from '@/common/types';
import { EditProfilePayload } from '@/user/types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition, TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const editUser = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<EditProfilePayload, BaseQueryFn, TagTypes, IdResponse, 'api'> => {
  return builder.mutation<IdResponse, EditProfilePayload>({
    query: (userData: EditProfilePayload): FetchArgs => {
      return {
        url: '/user',
        method: 'PATCH',
        body: userData
      };
    },
    invalidatesTags: (result?: IdResponse): TagDescription<TagTypes>[] => {
      if (!result) {
        return [];
      }

      const { id } = result;

      return [
        { type: 'user', id }
      ];
    }
  });
};
