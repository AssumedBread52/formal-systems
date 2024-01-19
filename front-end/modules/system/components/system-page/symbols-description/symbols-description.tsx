import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDescriptionsItem } from '@/common/components/antd-descriptions-item/antd-descriptions-item';
import { AntdDescriptions } from '@/common/components/antd-descriptions/antd-descriptions';
import { System } from '@/system/types/system';
import Link from 'next/link';
import { ReactElement } from 'react';

export const SymbolsDescription = (props: Pick<System, 'id' | 'constantSymbolCount' | 'variableSymbolCount'>): ReactElement => {
  const { id, constantSymbolCount, variableSymbolCount } = props;

  const exploreSymbols = (
    <Link href={`/formal-system/${id}/symbols`}>
      Explore
    </Link>
  );

  return (
    <AntdCard extra={exploreSymbols} title='Symbols' type='inner'>
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
  );
};
