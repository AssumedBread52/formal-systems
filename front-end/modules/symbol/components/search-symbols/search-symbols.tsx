import { ServerSideProps } from '@/app/types/server-side-props';
import { Metadata } from 'next';
import { ReactElement } from 'react';

export const SearchSymbols = (): ReactElement => {
  return (
    <h1>
      Search Symbols
    </h1>
  );
};

export const generateMetadata = async (props: ServerSideProps): Promise<Metadata> => {
  const { params } = props;

  const { 'system-title': systemTitle = '' } = params;

  return {
    title: `${decodeURIComponent(systemTitle)} Symbols`
  };
};
