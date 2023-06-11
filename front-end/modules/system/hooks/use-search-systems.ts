import { api } from '@/app/api';
import { SearchParameters } from '@/common/types/search-parameters';
import { SearchResults } from '@/common/types/search-results';
import { System } from '@/system/types/system';
import { useSearchParams } from 'next/navigation';

const { useSearchSystemsQuery } = api;

export const useSearchSystems = (): [SearchResults<System> | undefined, boolean, string] => {
  const searchParams = useSearchParams();

  const count = parseInt(searchParams.get('count') ?? '10');
  const keywords = searchParams.getAll('keywords');
  const page = parseInt(searchParams.get('page') ?? '1');

  const searchParameters = { count, page } as SearchParameters;
  if (0 < keywords.length) {
    searchParameters.keywords = keywords;
  }

  const { data, isError, isUninitialized } = useSearchSystemsQuery(searchParameters);

  return [data, isError || isUninitialized, isError ? 'Failed to search for formal systems.' : ''];
};
