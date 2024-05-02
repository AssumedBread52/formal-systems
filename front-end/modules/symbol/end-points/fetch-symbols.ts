import { Tags } from '@/app/constants/tags';
import { QueryParams } from '@/app/types/query-params';
import { TagTypes } from '@/app/types/tag-types';
import { PaginatedSearchResults } from '@/common/types/paginated-search-results';
import { Symbol } from '@/symbol/types/symbol';
import { BaseQueryFn, EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/query';
import { stringify } from 'querystring';

export const fetchSymbols = (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): QueryDefinition<QueryParams & Pick<Symbol, 'systemId'>, BaseQueryFn, TagTypes, PaginatedSearchResults<Symbol>, 'api'> => {
  return builder.query<PaginatedSearchResults<Symbol>, QueryParams & Pick<Symbol, 'systemId'>>({
    providesTags: [
      Tags.Symbol
    ],
    query: (queryArgs: QueryParams & Pick<Symbol, 'systemId'>): string => {
      const { page, count, 'keywords[]': keywords, systemId } = queryArgs;

      return `/system/${systemId}/symbol?${stringify({
        page,
        count,
        'keywords[]': keywords
      })}`;
    }
  });
};
