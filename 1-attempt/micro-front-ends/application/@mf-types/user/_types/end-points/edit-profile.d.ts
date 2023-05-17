import { EditProfilePayload, IdPayload } from '@/user/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
export declare const editProfile: (builder: EndpointBuilder<BaseQueryFn, 'user', 'user'>) => MutationDefinition<EditProfilePayload, BaseQueryFn, 'user', IdPayload, 'user'>;
