import { PaginatedResults, PaginationParameters } from '@/system/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
export declare const readPaginatedSystems: (builder: EndpointBuilder<BaseQueryFn, 'system', 'system'>) => QueryDefinition<PaginationParameters, BaseQueryFn, 'system', PaginatedResults, 'system'>;
