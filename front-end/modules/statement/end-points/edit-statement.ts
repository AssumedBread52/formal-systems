import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { IdPayload } from '@/common/types/id-payload';
import { EditStatementPayload } from '@/statement/types/edit-statement-payload';
import { BaseQueryFn, EndpointBuilder, FetchArgs, MutationDefinition, TagDescription } from '@reduxjs/toolkit/query';

export const editStatement = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<EditStatementPayload, BaseQueryFn, TagTypes, IdPayload, 'api'> => {
  return builder.mutation<IdPayload, EditStatementPayload>({
    invalidatesTags: (result?: IdPayload): TagDescription<TagTypes>[] => {
      if (!result) {
        return [];
      }

      const { id } = result;

      return [
        {
          id,
          type: Tags.Statement
        },
        Tags.Statement
      ];
    },
    query: (editStatementPayload: EditStatementPayload): FetchArgs => {
      const { id, newTitle, newDescription, systemId } = editStatementPayload;

      return {
        body: {
          newTitle,
          newDescription
        },
        method: 'PATCH',
        url: `/system/${systemId}/statement/${id}`
      };
    }
  });
};
