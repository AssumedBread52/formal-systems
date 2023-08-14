import { AppSearchParams } from '@/app/types/app-search-params';
import { PaginatedSearchResults } from '@/common/types/paginated-search-results';
import { Symbol } from '@/symbol/types/symbol';
import { stringify } from 'querystring';

export const fetchSymbolsSearch = async (systemId: string, searchParams: AppSearchParams): Promise<PaginatedSearchResults<Symbol>> => {
  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/system/${systemId}/symbol?${stringify(searchParams)}`, {
    cache: 'no-store'
  });

  return response.json();
};
