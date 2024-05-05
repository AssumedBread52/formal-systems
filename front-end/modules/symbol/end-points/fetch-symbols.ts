import { Tags } from '@/app/constants/tags';
import { TagTypes } from '@/app/types/tag-types';
import { PaginatedSearchResults } from '@/common/types/paginated-search-results';
import { SearchSymbolsParams } from '@/symbol/types/search-symbols-params';
import { Symbol } from '@/symbol/types/symbol';
import { BaseQueryFn, EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/query';
import { stringify } from 'querystring';

export const fetchSymbols = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): QueryDefinition<SearchSymbolsParams, BaseQueryFn, TagTypes, PaginatedSearchResults<Symbol>, 'api'> => {
  return builder.query<PaginatedSearchResults<Symbol>, SearchSymbolsParams>({
    providesTags: [
      Tags.Symbol
    ],
    query: (queryArgs: SearchSymbolsParams): string => {
      const { page, count, keywords, systemId } = queryArgs;

      return `/system/${systemId}/symbol?${stringify({
        page,
        count,
        'keywords[]': keywords
      })}`;
    }
  });
};
