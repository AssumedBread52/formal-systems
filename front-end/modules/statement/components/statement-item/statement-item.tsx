import { AntdCard } from '@/common/components/antd-card/antd-card';
import { Statement } from '@/statement/types/statement';
import { ReactElement } from 'react';

export const StatementItem = (props: Pick<Statement, 'id' | 'title' | 'description'>): ReactElement => {
  const { title, description } = props;

  return (
    <AntdCard title={title}>
      {description}
    </AntdCard>
  );
};
