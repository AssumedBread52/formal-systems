import { QueryParams } from '@/app/types/query-params';
import { PaginatedSearchResults } from '@/common/types/paginated-search-results';
import { Symbol } from '@/symbol/types/symbol';
import { stringify } from 'querystring';

export const fetchSymbolsSearch = async (systemId: string, queryParams: QueryParams): Promise<PaginatedSearchResults<Symbol>> => {
  const response = await fetch(`https://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/system/${systemId}/symbol?${stringify(queryParams)}`, {
    cache: 'no-store'
  });

  const { ok, statusText } = response;

  if (!ok) {
    throw new Error(statusText);
  }

  return response.json();
};
