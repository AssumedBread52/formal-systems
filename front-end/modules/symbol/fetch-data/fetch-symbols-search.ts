import { AppSearchParams } from '@/app/types/app-search-params';
import { SearchResults } from '@/common/types/search-results';
import { Symbol } from '@/symbol/types/symbol';
import { stringify } from 'querystring';

export const fetchSymbolSearch = async (systemId: string, searchParams: AppSearchParams): Promise<SearchResults<Symbol>> => {
  const response = await fetch(`http://localhost:${process.env.PORT}/api/system/${systemId}/symbol?${stringify(searchParams)}`, {
    cache: 'no-store'
  });

  return response.json();
};
