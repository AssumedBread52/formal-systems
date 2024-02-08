import { AntdCard } from '@/common/components/antd-card/antd-card';
import { Statement } from '@/statement/types/statement';
import { ReactElement } from 'react';

export const StatementItem = (props: Pick<Statement, 'id' | 'title'>): ReactElement => {
  const { id, title } = props;

  return (
    <AntdCard title={title}>
      {id}
    </AntdCard>
  );
};
