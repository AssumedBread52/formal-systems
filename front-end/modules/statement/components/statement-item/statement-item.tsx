import { AntdCard } from '@/common/components/antd-card/antd-card';
import { Statement } from '@/statement/types/statement';
import { ReactElement, ReactNode } from 'react';
import { RemoveStatement } from './remove-statement/remove-statement';

export const StatementItem = (props: Pick<Statement, 'id' | 'title' | 'description' | 'systemId' | 'createdByUserId'>): ReactElement => {
  const { id, title, description, systemId, createdByUserId } = props;

  const actions = [
    <RemoveStatement id={id} systemId={systemId} createdByUserId={createdByUserId} />
  ] as ReactNode[];

  return (
    <AntdCard actions={actions} title={title}>
      {description}
    </AntdCard>
  );
};
