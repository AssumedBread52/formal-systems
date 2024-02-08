import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { NewStatementPayload } from '@/statement/types/new-statement-payload';
import { BaseQueryFn, EndpointBuilder, FetchArgs, MutationDefinition } from '@reduxjs/toolkit/query';

export const addStatement = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<NewStatementPayload, BaseQueryFn, TagTypes, void, 'api'> => {
  return builder.mutation<void, NewStatementPayload>({
    invalidatesTags: [
      Tags.Statement
    ],
    query: (newStatementPayload: NewStatementPayload): FetchArgs => {
      const { title, description, systemId } = newStatementPayload;

      return {
        body: {
          title,
          description
        },
        method: 'POST',
        url: `/system/${systemId}/statement`
      };
    }
  });
};
