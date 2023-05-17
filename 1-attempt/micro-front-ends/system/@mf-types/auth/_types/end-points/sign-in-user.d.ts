import { SignInPayload, TokenPayload } from '@/auth/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
export declare const signInUser: (builder: EndpointBuilder<BaseQueryFn, 'auth', 'auth'>) => MutationDefinition<SignInPayload, BaseQueryFn, 'auth', TokenPayload, 'auth'>;
