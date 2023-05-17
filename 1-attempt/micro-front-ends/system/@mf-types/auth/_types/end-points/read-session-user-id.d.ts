import { IdPayload } from '@/auth/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
export declare const readSessionUserId: (builder: EndpointBuilder<BaseQueryFn, 'auth', 'auth'>) => QueryDefinition<void, BaseQueryFn, 'auth', IdPayload, 'auth'>;
