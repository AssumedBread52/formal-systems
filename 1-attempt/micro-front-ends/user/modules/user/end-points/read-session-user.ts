import { ClientUser } from '@/user/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition, TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const readSessionUser = (builder: EndpointBuilder<BaseQueryFn, 'user', 'user'>): QueryDefinition<void, BaseQueryFn, 'user', ClientUser, 'user'> => {
  return builder.query<ClientUser, void>({
    query: (): string => {
      return '/session-user'
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
