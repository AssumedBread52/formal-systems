import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { fetchSystem } from '@/system/fetch-data/fetch-system';
import { Metadata } from 'next';
import { ReactElement } from 'react';

export const SearchStatementsPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params } = props;

  const { 'system-id': systemId = '' } = params;

  const { title } = await fetchSystem(systemId);

  return (
    <AntdCard title={`${title} Statements`}>
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
