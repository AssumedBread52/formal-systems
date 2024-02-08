import { QueryParams } from '@/app/types/query-params';
import { PaginatedSearchResults } from '@/common/types/paginated-search-results';
import { Statement } from '@/statement/types/statement';
import { stringify } from 'querystring';

export const fetchStatementsSearch = async (systemId: string, queryParams: QueryParams): Promise<PaginatedSearchResults<Statement>> => {
  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/system/${systemId}/statement?${stringify(queryParams)}`, {
    cache: 'no-store'
  });

  const { ok, statusText } = response;

  if (!ok) {
    throw new Error(statusText);
  }

  return response.json();
};
