import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { IdPayload } from '@/common/types/id-payload';
import { EditProfilePayload } from '@/user/types/edit-profile-payload';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition, TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const editProfile = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<EditProfilePayload, BaseQueryFn, TagTypes, IdPayload, 'api'> => {
  return builder.mutation<IdPayload, EditProfilePayload>({
    invalidatesTags: (result?: IdPayload): TagDescription<TagTypes>[] => {
      if (!result) {
        return [];
      }

      const { id } = result;

      return [
        {
          type: Tags.User,
          id
        },
        Tags.SessionUser,
        Tags.User
      ];
    },
    query: (editProfilePayload: EditProfilePayload): FetchArgs => {
      return {
        body: editProfilePayload,
        method: 'PATCH',
        url: '/user/session-user'
      };
    }
  });
};
