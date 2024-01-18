import { QueryParams } from '@/app/types/query-params';
import { PaginatedSearchResults } from '@/common/types/paginated-search-results';
import { System } from '@/system/types/system';
import { stringify } from 'querystring';

export const fetchSystemsSearch = async (searchParams: QueryParams): Promise<PaginatedSearchResults<System>> => {
  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/system?${stringify(searchParams)}`, {
    cache: 'no-store'
  });

  return response.json();
};
