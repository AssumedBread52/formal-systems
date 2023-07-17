import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { SymbolItem } from '@/symbol/components/symbol-item/symbol-item';
import { fetchSymbol } from '@/symbol/fetch-data/fetch-symbol';
import { ReactElement } from 'react';
import { SymbolDescription } from './symbol-description/symbol-description';
import { Metadata } from 'next';

export const SymbolPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params } = props;

  const { 'system-id': systemId = '', 'system-title': systemTitle = '', 'symbol-id': symbolId = '' } = params;

  const { id, title, description, type, content, createdByUserId } = await fetchSymbol(systemId, symbolId);

  return (
    <AntdCard title={title}>
      <SymbolItem id={id} title={title} description={description} type={type} content={content} systemId={systemId} createdByUserId={createdByUserId} systemTitle={decodeURIComponent(systemTitle)} />
      <AntdDivider />
      <SymbolDescription />
    </AntdCard>
  );
};

export const generateMetadata = async (props: ServerSideProps): Promise<Metadata> => {
  const { params } = props;

  const { 'symbol-title': symbolTitle = '' } = params;

  return {
    title: decodeURIComponent(symbolTitle)
  };
};
