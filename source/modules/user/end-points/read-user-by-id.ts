import { TagTypes } from '@/app/types';
import { SearchByIdParameters } from '@/common/types';
import { ClientUser } from '@/user/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition, TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const readUserById = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): QueryDefinition<SearchByIdParameters, BaseQueryFn, TagTypes, ClientUser, 'api'> => {
  return builder.query<ClientUser, SearchByIdParameters>({
    query: (searchParameters: SearchByIdParameters): string => {
      return `/user/${searchParameters.id}`;
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
