import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDescriptionsItem } from '@/common/components/antd-descriptions-item/antd-descriptions-item';
import { AntdDescriptions } from '@/common/components/antd-descriptions/antd-descriptions';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { fetchSystem } from '@/system/fetch-data/fetch-system';
import Link from 'next/link';
import { ReactElement } from 'react';

export const SystemPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params } = props;

  const { 'system-id': systemId = '' } = params;

  const { id, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount } = await fetchSystem(systemId);

  const exploreSymbolsLink = (
    <Link href={`/formal-system/${id}/symbols`}>
      Explore
    </Link>
  );

  const exploreStatementsLink = (
    <Link href={`/formal-system/${id}/statements`}>
      Explore
    </Link>
  );

  return (
    <AntdCard title='Metrics'>
      <AntdCard extra={exploreSymbolsLink} title='Symbols' type='inner'>
        <AntdDescriptions bordered>
          <AntdDescriptionsItem label='Symbol Count'>
            {constantSymbolCount + variableSymbolCount}
          </AntdDescriptionsItem>
          <AntdDescriptionsItem label='Constant Symbol Count'>
            {constantSymbolCount}
          </AntdDescriptionsItem>
          <AntdDescriptionsItem label='Variable Symbol Count'>
            {variableSymbolCount}
          </AntdDescriptionsItem>
        </AntdDescriptions>
      </AntdCard>
      <AntdDivider />
      <AntdCard extra={exploreStatementsLink} title='Statements' type='inner'>
        <AntdDescriptions bordered>
          <AntdDescriptionsItem label='Statement Count'>
            {axiomCount + theoremCount + deductionCount}
          </AntdDescriptionsItem>
          <AntdDescriptionsItem label='Axiom Count'>
            {axiomCount}
          </AntdDescriptionsItem>
          <AntdDescriptionsItem label='Proven Statement Count'>
            {theoremCount + deductionCount}
          </AntdDescriptionsItem>
          <AntdDescriptionsItem label='Theorem Count'>
            {theoremCount}
          </AntdDescriptionsItem>
          <AntdDescriptionsItem label='Deduction Count'>
            {deductionCount}
          </AntdDescriptionsItem>
        </AntdDescriptions>
      </AntdCard>
    </AntdCard>
  );
};
