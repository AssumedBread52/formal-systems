import { ClientUser } from '@/user/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
export declare const readUserById: (builder: EndpointBuilder<BaseQueryFn, 'user', 'user'>) => QueryDefinition<string, BaseQueryFn, 'user', ClientUser, 'user'>;
