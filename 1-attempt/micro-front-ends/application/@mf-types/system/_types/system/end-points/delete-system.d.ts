import { IdPayload } from '@/system/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
export declare const deleteSystem: (builder: EndpointBuilder<BaseQueryFn, 'system', 'system'>) => MutationDefinition<string, BaseQueryFn, 'system', IdPayload, 'system'>;
