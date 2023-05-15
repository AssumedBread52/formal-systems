import { NewSystemPayload } from '@/system/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
export declare const createSystem: (builder: EndpointBuilder<BaseQueryFn, 'system', 'system'>) => MutationDefinition<NewSystemPayload, BaseQueryFn, 'system', void, 'system'>;
