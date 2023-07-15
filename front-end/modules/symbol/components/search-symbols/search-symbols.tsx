import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { PaginationSearchControls } from '@/common/components/pagination-search-controls/pagination-search-controls';
import { fetchSymbolSearch } from '@/symbol/fetch-data/fetch-symbols-search';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { CreateLink } from './create-link/create-link';
import { SymbolList } from './symbol-list/symbol-list';

export const SearchSymbols = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params, searchParams } = props;

  if (!searchParams.count) {
    searchParams.count = '10';
  }

  if (!searchParams.page) {
    searchParams.page = '1';
  }

  const { 'system-id': systemId = '', 'system-title': systemTitle = '' } = params;

  const { results, total } = await fetchSymbolSearch(systemId, searchParams);

  return (
    <AntdCard extra={<CreateLink id={systemId} title={systemTitle} />} title='Symbols'>
      <PaginationSearchControls resultType='Symbols' total={total}>
        <SymbolList symbols={results} systemTitle={systemTitle} />
      </PaginationSearchControls>
    </AntdCard>
  );
};

export const generateMetadata = async (props: ServerSideProps): Promise<Metadata> => {
  const { params } = props;

  const { 'system-title': systemTitle = '' } = params;

  return {
    title: `${decodeURIComponent(systemTitle)} Symbols`
  };
};
