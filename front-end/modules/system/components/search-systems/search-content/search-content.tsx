'use client';

import { SearchResults } from '@/common/types/search-results';
import { System } from '@/system/types/system';
import { SystemList } from './system-list/system-list';

export const SearchContent = (props: SearchResults<System>) => {
  const { results } = props;

  return (
    <SystemList systems={results} />
  );
};
