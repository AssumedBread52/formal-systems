import { AppSearchParams } from '@/app/types/app-search-params';
import { SearchResults } from '@/common/types/search-results';
import { System } from '@/system/types/system';
import { stringify } from 'querystring';

export const fetchSystemSearch = async (searchParams: AppSearchParams): Promise<SearchResults<System>> => {
  const response = await fetch(`http://localhost:${process.env.PORT}/api/system?${stringify(searchParams)}`, {
    cache: 'no-store'
  });

  return response.json();
};
