import { SignUpPayload, TokenPayload } from '@/auth/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
export declare const signUpUser: (builder: EndpointBuilder<BaseQueryFn, 'auth', 'auth'>) => MutationDefinition<SignUpPayload, BaseQueryFn, 'auth', TokenPayload, 'auth'>;
