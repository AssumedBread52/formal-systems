import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
export declare const signOutUser: (builder: EndpointBuilder<BaseQueryFn, 'auth', 'auth'>) => MutationDefinition<void, BaseQueryFn, 'auth', void, 'auth'>;
