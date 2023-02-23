import { TagTypes } from '@/app/types';
import { PaginatedParameters, PaginatedResults } from '@/common/types';
import { ClientFormalSystem } from '@/formal-system/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { stringify } from 'querystring';

export const readFormalSystems = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): QueryDefinition<PaginatedParameters, BaseQueryFn, TagTypes, PaginatedResults<ClientFormalSystem>, 'api'> => {
  return builder.query<PaginatedResults<ClientFormalSystem>, PaginatedParameters>({
    query: (paginatedParameters: PaginatedParameters): string => {
      return `/formal-system/read-paginated?${stringify(paginatedParameters)}`;
    },
    providesTags: ['formal-system']
  });
};
