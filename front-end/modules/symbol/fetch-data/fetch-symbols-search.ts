import { QueryParams } from '@/app/types/query-params';
import { PaginatedSearchResults } from '@/common/types/paginated-search-results';
import { Symbol } from '@/symbol/types/symbol';
import { stringify } from 'querystring';

export const fetchSymbolsSearch = async (systemId: string, searchParams: QueryParams): Promise<PaginatedSearchResults<Symbol>> => {
  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/system/${systemId}/symbol?${stringify(searchParams)}`, {
    cache: 'no-store'
  });

  return response.json();
};
