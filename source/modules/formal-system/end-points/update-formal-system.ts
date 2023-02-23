import { TagTypes } from '@/app/types';
import { IdResponse } from '@/common/types';
import { UpdateFormalSystemPayload } from '@/formal-system/types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const updateFormalSystem = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<UpdateFormalSystemPayload, BaseQueryFn, TagTypes, IdResponse, 'api'> => {
  return builder.mutation<IdResponse, UpdateFormalSystemPayload>({
    query: (formalSystemData: UpdateFormalSystemPayload): FetchArgs => {
      return {
        url: '/formal-system/update',
        method: 'PATCH',
        body: formalSystemData
      };
    },
    invalidatesTags: ['formal-system']
  });
};
