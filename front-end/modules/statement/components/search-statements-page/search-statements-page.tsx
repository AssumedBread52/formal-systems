import { ServerSideProps } from '@/app/types/server-side-props';
import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { PaginatedSearchControls } from '@/common/components/paginated-search-controls/paginated-search-controls';
import { fetchStatementsSearch } from '@/statement/fetch-data/fetch-statements-search';
import { fetchSystem } from '@/system/fetch-data/fetch-system';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { AddStatement } from './add-statement/add-statement';
import { StatementList } from './statement-list/statement-list';

export const SearchStatementsPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params, searchParams } = props;

  const { 'system-id': systemId = '' } = params;

  const { title, createdByUserId } = await fetchSystem(systemId);

  const { results, total } = await fetchStatementsSearch(systemId, searchParams);

  const addSystem = (
    <ProtectedContent userId={createdByUserId}>
      <AddStatement />
    </ProtectedContent>
  );

  return (
    <AntdCard extra={addSystem} title={`${title} Statements`}>
      <PaginatedSearchControls total={total}>
        <StatementList statements={results} />
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
