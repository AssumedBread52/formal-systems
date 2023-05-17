import { IdPayload } from '@/auth/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const readSessionUserId = (builder: EndpointBuilder<BaseQueryFn, 'auth', 'auth'>): QueryDefinition<void, BaseQueryFn, 'auth', IdPayload, 'auth'> => {
  return builder.query<IdPayload, void>({
    query: (): string => {
      return '/session-user-id';
    },
    providesTags: ['auth']
  });
};
