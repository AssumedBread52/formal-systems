import { IdResponse } from '@/common/types';
import { EditProfilePayload } from '@/user/types';
import { BaseQueryFn, FetchArgs, TagDescription } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const editUser = (builder: EndpointBuilder<BaseQueryFn, 'session-user', 'api'>): MutationDefinition<EditProfilePayload, BaseQueryFn, 'session-user', IdResponse, 'api'> => {
  return builder.mutation<IdResponse, EditProfilePayload>({
    query: (userData: EditProfilePayload): FetchArgs => {
      return {
        url: '/user/update',
        method: 'PATCH',
        body: userData
      };
    },
    invalidatesTags: (result?: IdResponse): TagDescription<'session-user'>[] => {
      if (result) {
        return ['session-user'];
      }

      return [];
    }
  });
};
