import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDescriptionsItem } from '@/common/components/antd-descriptions-item/antd-descriptions-item';
import { AntdDescriptions } from '@/common/components/antd-descriptions/antd-descriptions';
import { ReactElement } from 'react';

export const SymbolDescription = (): ReactElement => {
  return (
    <AntdCard title='Symbol Metrics' type='inner'>
      <AntdDescriptions bordered colon>
        <AntdDescriptionsItem label='Count of appearances'>
          0
        </AntdDescriptionsItem>
        <AntdDescriptionsItem label='Count of appearances in axiomatic statements'>
          0
        </AntdDescriptionsItem>
        <AntdDescriptionsItem label='Count of appearances in non-axiomatic statements'>
          0
        </AntdDescriptionsItem>
        <AntdDescriptionsItem label='Count of unique appearances'>
          0
        </AntdDescriptionsItem>
        <AntdDescriptionsItem label='Count of unique appearances in axiomatic statements'>
          0
        </AntdDescriptionsItem>
        <AntdDescriptionsItem label='Count of unique appearances in non-axiomatic statements'>
          0
        </AntdDescriptionsItem>
      </AntdDescriptions>
    </AntdCard>
  );
};
