import { TokenPayload } from '@/auth/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
export declare const refreshToken: (builder: EndpointBuilder<BaseQueryFn, 'auth', 'auth'>) => MutationDefinition<void, BaseQueryFn, 'auth', TokenPayload, 'auth'>;
