import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { SystemItem } from '@/system/components/system-item/system-item';
import { fetchSystem } from '@/system/fetch-data/fetch-system';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { SymbolDescription } from './symbol-description/symbol-description';

export const SystemPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params } = props;

  const { 'system-id': systemId = '' } = params;

  const { id, title, description, constantSymbolCount, variableSymbolCount, createdByUserId } = await fetchSystem(systemId);

  return (
    <AntdCard title={title}>
      <SystemItem id={id} title={title} description={description} createdByUserId={createdByUserId} />
      <AntdDivider />
      <SymbolDescription constantSymbolCount={constantSymbolCount} variableSymbolCount={variableSymbolCount} />
    </AntdCard>
  );
};

export const generateMetadata = async (props: ServerSideProps): Promise<Metadata> => {
  const { params } = props;

  const { 'system-title': systemTitle = '' } = params;

  return {
    title: decodeURIComponent(systemTitle)
  };
};
