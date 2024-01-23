import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDescriptionsItem } from '@/common/components/antd-descriptions-item/antd-descriptions-item';
import { AntdDescriptions } from '@/common/components/antd-descriptions/antd-descriptions';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { SymbolItem } from '@/symbol/components/symbol-item/symbol-item';
import { fetchSymbol } from '@/symbol/fetch-data/fetch-symbol';
import { Metadata } from 'next';
import { ReactElement } from 'react';

export const SymbolPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params } = props;

  const { 'system-id': systemId = '', 'symbol-id': symbolId = '' } = params;

  const { id, title, description, type, content, axiomAppearances, theoremAppearances, deductionAppearances, createdByUserId } = await fetchSymbol(systemId, symbolId);

  return (
    <AntdCard>
      <SymbolItem id={id} title={title} description={description} type={type} content={content} systemId={systemId} createdByUserId={createdByUserId} />
      <AntdDivider />
      <AntdCard title='Metrics'>
        <AntdDescriptions bordered>
          <AntdDescriptionsItem label='Appearance Count'>
            {axiomAppearances + theoremAppearances + deductionAppearances}
          </AntdDescriptionsItem>
          <AntdDescriptionsItem label='Appearance in Axioms Count'>
            {axiomAppearances}
          </AntdDescriptionsItem>
          <AntdDescriptionsItem label='Appearance in Theorems Count'>
            {theoremAppearances}
          </AntdDescriptionsItem>
          <AntdDescriptionsItem label='Appearance in Deductions Count'>
            {deductionAppearances}
          </AntdDescriptionsItem>
        </AntdDescriptions>
      </AntdCard>
    </AntdCard>
  );
};

export const generateMetadata = async (props: ServerSideProps): Promise<Metadata> => {
  const { params } = props;

  const { 'system-id': systemId = '', 'symbol-id': symbolId = '' } = params;

  const { title } = await fetchSymbol(systemId, symbolId);

  return {
    title
  };
};
