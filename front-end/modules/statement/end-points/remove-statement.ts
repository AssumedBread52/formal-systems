import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { IdPayload } from '@/common/types/id-payload';
import { Statement } from '@/statement/types/statement';
import { BaseQueryFn, EndpointBuilder, FetchArgs, MutationDefinition, TagDescription } from '@reduxjs/toolkit/query';

export const removeStatement = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): MutationDefinition<Pick<Statement, 'id' | 'systemId'>, BaseQueryFn, TagTypes, IdPayload, 'api'> => {
  return builder.mutation<IdPayload, Pick<Statement, 'id' | 'systemId'>>({
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
    query: (removeStatementPayload: Pick<Statement, 'id' | 'systemId'>): FetchArgs => {
      const { id, systemId } = removeStatementPayload;

      return {
        method: 'DELETE',
        url: `/system/${systemId}/statement/${id}`
      };
    }
  });
};
