import { ClientUser } from '@/user/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
export declare const readSessionUser: (builder: EndpointBuilder<BaseQueryFn, 'user', 'user'>) => QueryDefinition<void, BaseQueryFn, 'user', ClientUser, 'user'>;
