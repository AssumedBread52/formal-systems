import { PaginatedResults, PaginationParameters } from '@/system/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { stringify } from 'querystring';

export const readPaginatedSystems = (builder: EndpointBuilder<BaseQueryFn, 'system', 'system'>): QueryDefinition<PaginationParameters, BaseQueryFn, 'system', PaginatedResults, 'system'> => {
  return builder.query({
    query: (paginationParameters: PaginationParameters): string => {
      return `?${stringify(paginationParameters)}`;
    },
    providesTags: ['system']
  });
};
