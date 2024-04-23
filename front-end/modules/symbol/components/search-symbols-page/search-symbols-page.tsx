import { ServerSideProps } from '@/app/types/server-side-props';
import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { PaginatedSearchControls } from '@/common/components/paginated-search-controls/paginated-search-controls';
import { fetchSymbolsSearch } from '@/symbol/fetch-data/fetch-symbols-search';
import { fetchSystem } from '@/system/fetch-data/fetch-system';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { AddSymbol } from './add-symbol/add-symbol';
import { SymbolList } from './symbol-list/symbol-list';

export const SearchSymbolsPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params, searchParams } = props;

  const { 'system-id': systemId = '' } = params;

  const { title, createdByUserId } = await fetchSystem(systemId);

  const { results, total } = await fetchSymbolsSearch(systemId, searchParams);

  const addSymbol = (
    <ProtectedContent userId={createdByUserId}>
      <AddSymbol />
    </ProtectedContent>
  );

  return (
    <AntdCard extra={addSymbol} title={`${title} Symbols`}>
      <PaginatedSearchControls total={total}>
        <SymbolList symbols={results} />
      </PaginatedSearchControls>
    </AntdCard>
  );
};

export const generateMetadata = async (props: ServerSideProps): Promise<Metadata> => {
  const { params } = props;

  const { 'system-id': systemId = '' } = params;

  const { title } = await fetchSystem(systemId);

  return {
    title: `${title} Symbols`
  };
};
