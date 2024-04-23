import { ServerSideProps } from '@/app/types/server-side-props';
import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { PaginatedSearchControls } from '@/common/components/paginated-search-controls/paginated-search-controls';
import { fetchSystemsSearch } from '@/system/fetch-data/fetch-systems-search';
import { ReactElement } from 'react';
import { AddSystem } from './add-system/add-system';
import { SystemList } from './system-list/system-list';

export const SearchSystemsPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { searchParams } = props;

  const { results, total } = await fetchSystemsSearch(searchParams);

  const addSystem = (
    <ProtectedContent>
      <AddSystem />
    </ProtectedContent>
  );

  return (
    <AntdCard extra={addSystem} title='Formal Systems'>
      <PaginatedSearchControls total={total}>
        <SystemList systems={results} />
      </PaginatedSearchControls>
    </AntdCard>
  );
};
