import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { PaginatedSearchResults } from '@/common/types/paginated-search-results';
import { SearchSymbolsParams } from '@/symbol/types/search-symbols-params';
import { SearchSymbolsQueryParams } from '@/symbol/types/search-symbols-query-params';
import { Symbol } from '@/symbol/types/symbol';
import { BaseQueryFn, EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/query';
import { stringify } from 'querystring';

export const fetchSymbols = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): QueryDefinition<SearchSymbolsParams, BaseQueryFn, TagTypes, PaginatedSearchResults<Symbol>, 'api'> => {
  return builder.query<PaginatedSearchResults<Symbol>, SearchSymbolsParams>({
    providesTags: [
      Tags.Symbol
    ],
    query: (queryArgs: SearchSymbolsParams): string => {
      const { page, count, keywords, types, systemId } = queryArgs;

      const queryParams = {} as SearchSymbolsQueryParams;

      if (page) {
        queryParams.page = page;
      }
      if (count) {
        queryParams.count = count;
      }
      if (keywords && keywords.length > 0) {
        queryParams['keywords[]'] = keywords;
      }
      if (types && types.length > 0) {
        queryParams['types[]'] = types;
      }

      return `/system/${systemId}/symbol?${stringify(queryParams)}`;
    }
  });
};
