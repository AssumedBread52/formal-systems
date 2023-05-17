import { NewSystemPayload } from '@/system/types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const createSystem = (builder: EndpointBuilder<BaseQueryFn, 'system', 'system'>): MutationDefinition<NewSystemPayload, BaseQueryFn, 'system', void, 'system'> => {
  return builder.mutation<void, NewSystemPayload>({
    query: (newSystemPayload: NewSystemPayload): FetchArgs => {
      return {
        url: '',
        method: 'POST',
        body: newSystemPayload
      };
    },
    invalidatesTags: ['system']
  });
};
