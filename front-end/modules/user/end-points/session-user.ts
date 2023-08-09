import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { User } from '@/user/types/user';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const sessionUser = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): QueryDefinition<void, BaseQueryFn, TagTypes, User, 'api'> => {
  return builder.query<User, void>({
    providesTags: [
      Tags.SessionUser
    ],
    query: (): string => {
      return '/user/session-user';
    }
  });
};
