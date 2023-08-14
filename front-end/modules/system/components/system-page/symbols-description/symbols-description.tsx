import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDescriptionsItem } from '@/common/components/antd-descriptions-item/antd-descriptions-item';
import { AntdDescriptions } from '@/common/components/antd-descriptions/antd-descriptions';
import { System } from '@/system/types/system';
import Link from 'next/link';
import { ReactElement } from 'react';

export const SymbolsDescription = (props: Pick<System, 'id' | 'title' | 'constantSymbolCount' | 'variableSymbolCount'>): ReactElement => {
  const { id, title, constantSymbolCount, variableSymbolCount } = props;

  const exploreSymbols = (
    <Link href={`/formal-system/${id}/${title}/symbols`}>
      Explore
    </Link>
  );

  return (
    <AntdCard extra={exploreSymbols} title='Symbols' type='inner'>
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
