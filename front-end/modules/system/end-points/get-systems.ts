import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { SearchParameters } from '@/common/types/search-parameters';
import { SearchResults } from '@/common/types/search-results';
import { System } from '@/system/types/system';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { stringify } from 'querystring';

export const getSystems = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): QueryDefinition<SearchParameters, BaseQueryFn, TagTypes, SearchResults<System>, 'api'> => {
  return builder.query<SearchResults<System>, SearchParameters>({
    providesTags: [Tags.System],
    query: (searchParameters: SearchParameters): string => {
      return `/system?${stringify(searchParameters)}`;
    }
  });
};
