import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDescriptionsItem } from '@/common/components/antd-descriptions-item/antd-descriptions-item';
import { AntdDescriptions } from '@/common/components/antd-descriptions/antd-descriptions';
import { System } from '@/system/types/system';
import Link from 'next/link';
import { ReactElement } from 'react';

export const SymbolDescription = (props: Omit<System, 'description' | 'createdByUserId'>): ReactElement => {
  const { id, title, constantSymbolCount, variableSymbolCount } = props;

  const exploreLink = (
    <Link href={`/formal-system/${id}/${title}/symbols`}>
      Explore
    </Link>
  );

  return (
    <AntdCard extra={exploreLink} title='Symbols' type='inner'>
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
