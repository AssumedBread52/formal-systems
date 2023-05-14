import { ClientSystem } from '@/system/types';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition, TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const readSystemByUrlPath = (builder: EndpointBuilder<BaseQueryFn, 'system', 'system'>): QueryDefinition<string, BaseQueryFn, 'system', ClientSystem, 'system'> => {
  return builder.query<ClientSystem, string>({
    query: (urlPath: string): string => {
      return `/${urlPath}`;
    },
    providesTags: (result?: ClientSystem): TagDescription<'system'>[] => {
      if (!result) {
        return [];
      }

      const { id } = result;

      return [{ type: 'system', id }];
    }
  });
};
