import { PaginatedParameters, PaginatedResults } from '#/modules/common/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { stringify } from 'querystring';
import { ClientFormalSystem } from '../types';

export const readFormalSystems = (builder: EndpointBuilder<BaseQueryFn, '', 'api'>): QueryDefinition<PaginatedParameters, BaseQueryFn, '', PaginatedResults<ClientFormalSystem>, 'api'> => {
  return builder.query<PaginatedResults<ClientFormalSystem>, PaginatedParameters>({
    query: (paginatedParameters: PaginatedParameters): string => {
      return `/formal-system/read-paginated?${stringify(paginatedParameters)}`;
    }
  });
};
