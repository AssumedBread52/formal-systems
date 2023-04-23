import { TagTypes } from '@/app/types';
import { ClientUser } from '@/user/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition, TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const readUserById = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): QueryDefinition<string, BaseQueryFn, TagTypes, ClientUser, 'api'> => {
  return builder.query<ClientUser, string>({
    query: (userId: string): string => {
      return `/user/${userId}`;
    },
    providesTags: (result?: ClientUser): TagDescription<TagTypes>[] => {
      if (!result) {
        return [];
      }

      const { id } = result;

      return [{ type: 'user', id }];
    }
  });
};
