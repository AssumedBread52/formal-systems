import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { NewSymbolPayload } from '@/symbol/types/new-symbol-payload';
import { BaseQueryFn, EndpointBuilder, FetchArgs, MutationDefinition } from '@reduxjs/toolkit/query';

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
