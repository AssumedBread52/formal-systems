import { IdPayload, UpdateSystemPayload } from '@/system/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
export declare const updateSystem: (builder: EndpointBuilder<BaseQueryFn, 'system', 'system'>) => MutationDefinition<UpdateSystemPayload, BaseQueryFn, 'system', IdPayload, 'system'>;
