import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { Metadata } from 'next';
import { ReactElement } from 'react';

export const SearchSymbols = (): ReactElement => {
  return (
    <AntdCard title='Symbols'>
      Search Symbols
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
