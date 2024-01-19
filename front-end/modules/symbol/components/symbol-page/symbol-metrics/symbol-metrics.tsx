import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDescriptionsItem } from '@/common/components/antd-descriptions-item/antd-descriptions-item';
import { AntdDescriptions } from '@/common/components/antd-descriptions/antd-descriptions';
import { Symbol } from '@/symbol/types/symbol';
import { ReactElement } from 'react';

export const SymbolMetrics = (props: Pick<Symbol, 'axiomaticStatementAppearances' | 'nonAxiomaticStatementAppearances'>): ReactElement => {
  const { axiomaticStatementAppearances, nonAxiomaticStatementAppearances } = props;

  return (
    <AntdCard title='Symbol Metrics' type='inner'>
      <AntdDescriptions bordered>
        <AntdDescriptionsItem label='Count of appearances'>
          {axiomaticStatementAppearances + nonAxiomaticStatementAppearances}
        </AntdDescriptionsItem>
        <AntdDescriptionsItem label='Count of appearances in axiomatic statements'>
          {axiomaticStatementAppearances}
        </AntdDescriptionsItem>
        <AntdDescriptionsItem label='Count of appearances in non-axiomatic statements'>
          {nonAxiomaticStatementAppearances}
        </AntdDescriptionsItem>
      </AntdDescriptions>
    </AntdCard>
  );
};
