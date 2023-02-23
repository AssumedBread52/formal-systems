import { TagTypes } from '@/app/types';
import { DeleteByIdPayload, IdResponse } from '@/common/types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const deleteFormalSystem = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<DeleteByIdPayload, BaseQueryFn, TagTypes, IdResponse, 'api'> => {
  return builder.mutation<IdResponse, DeleteByIdPayload>({
    query: (idPayload: DeleteByIdPayload): FetchArgs => {
      return {
        url: '/formal-system/delete',
        method: 'DELETE',
        body: idPayload
      };
    },
    invalidatesTags: ['formal-system']
  });
};
