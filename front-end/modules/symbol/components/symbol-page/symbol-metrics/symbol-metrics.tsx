import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDescriptionsItem } from '@/common/components/antd-descriptions-item/antd-descriptions-item';
import { AntdDescriptions } from '@/common/components/antd-descriptions/antd-descriptions';
import { Symbol } from '@/symbol/types/symbol';
import { ReactElement } from 'react';

export const SymbolMetrics = (props: Pick<Symbol, 'axiomAppearances' | 'theoremAppearances' | 'deductionAppearances'>): ReactElement => {
  const { axiomAppearances, theoremAppearances, deductionAppearances } = props;

  return (
    <AntdCard title='Symbol Metrics' type='inner'>
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
  );
};
