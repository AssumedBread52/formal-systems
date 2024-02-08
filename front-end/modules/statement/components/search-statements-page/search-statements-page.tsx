import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { PaginatedSearchControls } from '@/common/components/paginated-search-controls/paginated-search-controls';
import { fetchStatementsSearch } from '@/statement/fetch-data/fetch-statements-search';
import { fetchSystem } from '@/system/fetch-data/fetch-system';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { AddStatement } from './add-statement/add-statement';

export const SearchStatementsPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params, searchParams } = props;

  if (!searchParams.page) {
    searchParams.page = '1';
  }

  if (!searchParams.count) {
    searchParams.count = '10';
  }

  const { 'system-id': systemId = '' } = params;

  const { title, createdByUserId } = await fetchSystem(systemId);

  const { results, total } = await fetchStatementsSearch(systemId, searchParams);

  return (
    <AntdCard extra={<AddStatement createdByUserId={createdByUserId} />} title={`${title} Statements`}>
      <PaginatedSearchControls total={total}>
        {results.length}
      </PaginatedSearchControls>
    </AntdCard>
  );
};

export const generateMetadata = async (props: ServerSideProps): Promise<Metadata> => {
  const { params } = props;

  const { 'system-id': systemId = '' } = params;

  const { title } = await fetchSystem(systemId);

  return {
    title: `${title} Statements`
  };
};
