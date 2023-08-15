import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { PaginatedSearchControls } from '@/common/components/paginated-search-controls/paginated-search-controls';
import { fetchSymbolsSearch } from '@/symbol/fetch-data/fetch-symbols-search';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { CreateLink } from './create-link/create-link';
import { SymbolList } from './symbol-list/symbol-list';

export const SearchSymbols = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params, searchParams } = props;

  if (!searchParams.page) {
    searchParams.page = '1';
  }

  if (!searchParams.count) {
    searchParams.count = '10';
  }

  const { 'system-id': systemId = '', 'system-title': systemTitle = '' } = params;

  const { results, total } = await fetchSymbolsSearch(systemId, searchParams);

  return (
    <AntdCard extra={<CreateLink id={systemId} title={systemTitle} />} title={`${decodeURIComponent(systemTitle)} Symbols`}>
      <PaginatedSearchControls resultType='Symbols' total={total}>
        <SymbolList symbols={results} systemTitle={systemTitle} />
      </PaginatedSearchControls>
    </AntdCard>
  );
};

export const generateMetadata = (props: ServerSideProps): Metadata => {
  const { params } = props;

  const { 'system-title': systemTitle = '' } = params;

  return {
    title: `${decodeURIComponent(systemTitle)} Symbols`
  };
};
