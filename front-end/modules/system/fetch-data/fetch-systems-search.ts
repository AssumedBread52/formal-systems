import { QueryParams } from '@/app/types/query-params';
import { PaginatedSearchResults } from '@/common/types/paginated-search-results';
import { System } from '@/system/types/system';
import { stringify } from 'querystring';

export const fetchSystemsSearch = async (queryParams: QueryParams): Promise<PaginatedSearchResults<System>> => {
  const response = await fetch(`https://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/system?${stringify(queryParams)}`, {
    cache: 'no-store'
  });

  const { ok, statusText } = response;

  if (!ok) {
    throw new Error(statusText);
  }

  return response.json();
};
