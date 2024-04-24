import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { Statement } from '@/statement/types/statement';
import { ReactElement } from 'react';
import { EditStatement } from './edit-statement/edit-statement';
import { ExploreStatementLink } from './explore-statement-link/explore-statement-link';
import { RemoveStatement } from './remove-statement/remove-statement';

export const StatementItem = (props: Pick<Statement, 'id' | 'title' | 'description' | 'distinctVariableRestrictions' | 'variableTypeHypotheses' | 'logicalHypotheses' | 'assertion' | 'systemId' | 'createdByUserId'>): ReactElement => {
  const { id, title, description, distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion, systemId, createdByUserId } = props;

  const actions = [
    <ProtectedContent userId={createdByUserId}>
      <EditStatement id={id} newTitle={title} newDescription={description} newDistinctVariableRestrictions={distinctVariableRestrictions} newVariableTypeHypotheses={variableTypeHypotheses} newLogicalHypotheses={logicalHypotheses} newAssertion={assertion} systemId={systemId} />
    </ProtectedContent>,
    <ProtectedContent userId={createdByUserId}>
      <RemoveStatement id={id} systemId={systemId} />
    </ProtectedContent>
  ];

  return (
    <AntdCard actions={actions} extra={<ExploreStatementLink id={id} systemId={systemId} />} title={title} type='inner'>
      {description}
    </AntdCard>
  );
};
