import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { SearchResults } from '@/common/types/search-results';
import { System } from '@/system/types/system';
import { stringify } from 'querystring';
import { ReactElement } from 'react';
import { CreateLink } from './create-link/create-link';
import { SearchContent } from './search-content/search-content';

export const SearchSystems = async (props: ServerSideProps): Promise<ReactElement> => {
  const { searchParams } = props;

  if (!searchParams.count) {
    searchParams.count = '10';
  }

  if (!searchParams.page) {
    searchParams.page = '1';
  }

  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.NEXT_PUBLIC_BACK_END_PORT}/system?${stringify(searchParams)}`, {
    cache: 'no-store'
  });

  const searchResults = await response.json() as SearchResults<System>;

  const { results, total } = searchResults;

  return (
    <AntdCard extra={<CreateLink />} title='Formal Systems'>
      <SearchContent results={results} total={total} />
    </AntdCard>
  );
};
