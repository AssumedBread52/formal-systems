import { ClientUser } from '@/user/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition, TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const readUserById = (builder: EndpointBuilder<BaseQueryFn, 'user', 'user'>): QueryDefinition<string, BaseQueryFn, 'user', ClientUser, 'user'> => {
  return builder.query<ClientUser, string>({
    query: (userId: string): string => {
      return `/${userId}`;
    },
    providesTags: (result?: ClientUser): TagDescription<'user'>[] => {
      if (!result) {
        return [];
      }

      const { id } = result;

      return [{ type: 'user', id }];
    }
  });
};
