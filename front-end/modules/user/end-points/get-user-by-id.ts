import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { User } from '@/user/types/user';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition, TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const getUserById = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): QueryDefinition<string, BaseQueryFn, TagTypes, User, 'api'> => {
  return builder.query<User, string>({
    providesTags: (result?: User): TagDescription<TagTypes>[] => {
      if (!result) {
        return [];
      }

      const { id } = result;

      return [
        {
          type: Tags.User,
          id
        }
      ];
    },
    query: (userId: string): string => {
      return `/user/${userId}`;
    }
  });
};
