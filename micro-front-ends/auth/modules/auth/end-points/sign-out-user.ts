import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const signOutUser = (builder: EndpointBuilder<BaseQueryFn, 'auth', 'auth'>): MutationDefinition<void, BaseQueryFn, 'auth', void, 'auth'> => {
  return builder.mutation<void, void>({
    query: (): FetchArgs => {
      return {
        url: '/sign-out',
        method: 'POST'
      };
    }
  });
};
