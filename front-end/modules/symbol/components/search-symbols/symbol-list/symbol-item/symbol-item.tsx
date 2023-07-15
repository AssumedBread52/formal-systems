import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { Symbol } from '@/symbol/types/symbol';
import { ReactElement } from 'react';

export const SymbolItem = (props: Omit<Symbol, 'id' | 'type' | 'content' | 'systemId' | 'createdByUserId'>): ReactElement => {
  const { title, description } = props;

  return (
    <AntdCard title={title} type='inner'>
      {description}
      <AntdDivider />
    </AntdCard>
  );
};
