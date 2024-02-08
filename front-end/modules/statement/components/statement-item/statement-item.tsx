import { AntdCard } from '@/common/components/antd-card/antd-card';
import { Statement } from '@/statement/types/statement';
import Link from 'next/link';
import { ReactElement, ReactNode } from 'react';
import { EditStatement } from './edit-statement/edit-statement';
import { RemoveStatement } from './remove-statement/remove-statement';

export const StatementItem = (props: Pick<Statement, 'id' | 'title' | 'description' | 'systemId' | 'createdByUserId'>): ReactElement => {
  const { id, title, description, systemId, createdByUserId } = props;

  const actions = [
    <EditStatement id={id} title={title} description={description} systemId={systemId} createdByUserId={createdByUserId} />,
    <RemoveStatement id={id} systemId={systemId} createdByUserId={createdByUserId} />
  ] as ReactNode[];

  const exploreStatementLink = (
    <Link href={`/formal-system/${systemId}/statement/${id}`}>
      Explore
    </Link>
  );

  return (
    <AntdCard actions={actions} extra={exploreStatementLink} title={title} type='inner'>
      {description}
    </AntdCard>
  );
};
