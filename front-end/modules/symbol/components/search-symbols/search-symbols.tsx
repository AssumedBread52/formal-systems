import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { PaginationSearchControls } from '@/common/components/pagination-search-controls/pagination-search-controls';
import { Metadata } from 'next';
import { ReactElement } from 'react';

export const SearchSymbols = (): ReactElement => {
  const total = 0;

  return (
    <AntdCard title='Symbols'>
      <PaginationSearchControls resultType='Symbols' total={total}>
        Search Symbols
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
