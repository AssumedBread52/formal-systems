import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { NewSystemPayload } from '@/system/types/new-system-payload';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const createSystem = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<NewSystemPayload, BaseQueryFn, TagTypes, void, 'api'> => {
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
