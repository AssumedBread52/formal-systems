import { ClientSystem } from '@/system/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
export declare const readSystemByUrlPath: (builder: EndpointBuilder<BaseQueryFn, 'system', 'system'>) => QueryDefinition<string, BaseQueryFn, 'system', ClientSystem, 'system'>;
