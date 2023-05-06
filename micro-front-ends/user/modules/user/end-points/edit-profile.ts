import { EditProfilePayload, IdPayload } from '@/user/types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition, TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const editProfile = (builder: EndpointBuilder<BaseQueryFn, 'user', 'user'>): MutationDefinition<EditProfilePayload, BaseQueryFn, 'user', IdPayload, 'user'> => {
  return builder.mutation<IdPayload, EditProfilePayload>({
    query: (editProfilePayload: EditProfilePayload): FetchArgs => {
      return {
        url: '/session-user',
        method: 'PATCH',
        body: editProfilePayload
      };
    },
    invalidatesTags: (result?: IdPayload): TagDescription<'user'>[] => {
      if (!result) {
        return [];
      }

      const { id } = result;

      return [{ type: 'user', id }];
    }
  });
};
