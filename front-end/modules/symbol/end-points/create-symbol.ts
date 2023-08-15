import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { NewSymbolPayload } from '@/symbol/types/new-symbol-payload';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, MutationDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const createSymbol = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<NewSymbolPayload, BaseQueryFn, TagTypes, void, 'api'> => {
  return builder.mutation<void, NewSymbolPayload>({
    invalidatesTags: [
      Tags.Symbol
    ],
    query: (newSymbolPayload: NewSymbolPayload): FetchArgs => {
      const { title, description, type, content, systemId } = newSymbolPayload;

      return {
        body: {
          title,
          description,
          type,
          content
        },
        method: 'POST',
        url: `/system/${systemId}/symbol`
      };
    }
  });
};
