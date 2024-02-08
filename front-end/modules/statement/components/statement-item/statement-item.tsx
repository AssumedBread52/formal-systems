import { AntdCard } from '@/common/components/antd-card/antd-card';
import { Statement } from '@/statement/types/statement';
import { ReactElement, ReactNode } from 'react';
import { EditStatement } from './edit-statement/edit-statement';
import { ExploreStatementLink } from './explore-statement-link/explore-statement-link';
import { RemoveStatement } from './remove-statement/remove-statement';

export const StatementItem = (props: Pick<Statement, 'id' | 'title' | 'description' | 'systemId' | 'createdByUserId'>): ReactElement => {
  const { id, title, description, systemId, createdByUserId } = props;

  const actions = [
    <EditStatement id={id} title={title} description={description} systemId={systemId} createdByUserId={createdByUserId} />,
    <RemoveStatement id={id} systemId={systemId} createdByUserId={createdByUserId} />
  ] as ReactNode[];

  return (
    <AntdCard actions={actions} extra={<ExploreStatementLink id={id} systemId={systemId} />} title={title} type='inner'>
      {description}
    </AntdCard>
  );
};
