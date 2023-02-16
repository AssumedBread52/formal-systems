import { NewFormalSystemPayload } from '@/formal-system/types';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const createFormalSystem = (builder: EndpointBuilder<BaseQueryFn, '', 'api'>): MutationDefinition<NewFormalSystemPayload, BaseQueryFn, '', void, 'api'> => {
  return builder.mutation<void, NewFormalSystemPayload>({
    query: (formalSystemData: NewFormalSystemPayload): FetchArgs => {
      return {
        url: '/formal-system/create',
        method: 'POST',
        body: formalSystemData
      };
    }
  });
};
