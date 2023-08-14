import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { PaginatedSearchControls } from '@/common/components/paginated-search-controls/paginated-search-controls';
import { fetchSystemsSearch } from '@/system/fetch-data/fetch-systems-search';
import { ReactElement } from 'react';
import { CreateLink } from './create-link/create-link';
import { SystemList } from './system-list/system-list';

export const SearchSystems = async (props: ServerSideProps): Promise<ReactElement> => {
  const { searchParams } = props;

  if (!searchParams.page) {
    searchParams.page = '1';
  }

  if (!searchParams.count) {
    searchParams.count = '10';
  }

  const { results, total } = await fetchSystemsSearch(searchParams);

  return (
    <AntdCard extra={<CreateLink />} title='Formal Systems'>
      <PaginatedSearchControls resultType='Formal Systems' total={total}>
        <SystemList systems={results} />
      </PaginatedSearchControls>
    </AntdCard>
  );
};
