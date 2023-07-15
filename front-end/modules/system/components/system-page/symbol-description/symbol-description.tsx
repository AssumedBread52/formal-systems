import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDescriptionsItem } from '@/common/components/antd-descriptions-item/antd-descriptions-item';
import { AntdDescriptions } from '@/common/components/antd-descriptions/antd-descriptions';
import { System } from '@/system/types/system';
import { ReactElement } from 'react';

export const SymbolDescription = (props: Omit<System, 'id' | 'title' | 'description' | 'createdByUserId'>): ReactElement => {
  const { constantSymbolCount, variableSymbolCount } = props;

  return (
    <AntdCard title='Symbols' type='inner'>
      <AntdDescriptions bordered colon>
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
  );
};
