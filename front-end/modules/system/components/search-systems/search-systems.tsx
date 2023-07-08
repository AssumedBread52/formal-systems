import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { PaginationSearchControls } from '@/common/components/pagination-search-controls/pagination-search-controls';
import { fetchSystemSearch } from '@/system/fetch-data/fetch-systems-search';
import { ReactElement } from 'react';
import { CreateLink } from './create-link/create-link';
import { SystemList } from './system-list/system-list';

export const SearchSystems = async (props: ServerSideProps): Promise<ReactElement> => {
  const { searchParams } = props;

  if (!searchParams.count) {
    searchParams.count = '10';
  }

  if (!searchParams.page) {
    searchParams.page = '1';
  }

  const { results, total } = await fetchSystemSearch(searchParams);

  return (
    <AntdCard extra={<CreateLink />} title='Formal Systems'>
      <PaginationSearchControls resultType='Formal Systems' total={total}>
        <SystemList systems={results} />
      </PaginationSearchControls>
    </AntdCard>
  );
};
