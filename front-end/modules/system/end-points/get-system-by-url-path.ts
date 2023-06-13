import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { System } from '@/system/types/system';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition, TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export const getSystemByUrlPath = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): QueryDefinition<string, BaseQueryFn, TagTypes, System, 'api'> => {
  return builder.query<System, string>({
    providesTags: (result?: System): TagDescription<TagTypes>[] => {
      if (!result) {
        return [];
      }

      const { id } = result;

      return [
        {
          type: Tags.System,
          id
        }
      ];
    },
    query: (urlPath: string): string => {
      return `/system/${urlPath}`;
    }
  });
};
