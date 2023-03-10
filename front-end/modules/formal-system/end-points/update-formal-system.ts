import { TagTypes } from '@/app/types';
import { IdResponse } from '@/common/types';
import { UpdateFormalSystemPayload } from '@/formal-system/types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const updateFormalSystem = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<UpdateFormalSystemPayload, BaseQueryFn, TagTypes, IdResponse, 'api'> => {
  return builder.mutation<IdResponse, UpdateFormalSystemPayload>({
    query: (formalSystemData: UpdateFormalSystemPayload): FetchArgs => {
      const { id, title, description } = formalSystemData;

      return {
        url: `/formal-system/${id}`,
        method: 'PATCH',
        body: {
          title,
          description
        }
      };
    },
    invalidatesTags: ['formal-system']
  });
};
