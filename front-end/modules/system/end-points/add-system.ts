import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { NewSystemPayload } from '@/system/types/new-system-payload';
import { BaseQueryFn, EndpointBuilder, FetchArgs, MutationDefinition } from '@reduxjs/toolkit/query';

export const addSystem = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<NewSystemPayload, BaseQueryFn, TagTypes, void, 'api'> => {
  return builder.mutation<void, NewSystemPayload>({
    invalidatesTags: [
      Tags.System
    ],
    query: (newSystemPayload: NewSystemPayload): FetchArgs => {
      return {
        body: newSystemPayload,
        method: 'POST',
        url: '/system'
      };
    }
  });
};
