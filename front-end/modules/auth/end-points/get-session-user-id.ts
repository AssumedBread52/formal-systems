import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { IdPayload } from '@/common/types/id-payload';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const getSessionUserId = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): QueryDefinition<void, BaseQueryFn, TagTypes, IdPayload, 'api'> => {
  return builder.query<IdPayload, void>({
    providesTags: [Tags.SessionUserId],
    query: (): string => {
      return '/auth/session-user-id';
    }
  });
};
