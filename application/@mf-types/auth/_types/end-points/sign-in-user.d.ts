import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { SignInPayload } from '@/auth/types';
export declare const signInUser: (builder: EndpointBuilder<BaseQueryFn, never, 'auth'>) => MutationDefinition<SignInPayload, BaseQueryFn, never, boolean, 'auth'>;
