import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { AntdListItem } from '@/common/components/antd-list-item/antd-list-item';
import { AntdList } from '@/common/components/antd-list/antd-list';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { Statement } from '@/statement/types/statement';
import { DisplayExpression } from '@/symbol/components/display-expression/display-expression';
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
      <AntdDivider />
      <AntdRow gutter={[0, 16]}>
        <AntdCol span={24}>
          <AntdList bordered header='Distinct Variable Restrictions'>
            {distinctVariableRestrictions.map((distinctVariableRestriction: [string, string]): ReactElement => {
              return (
                <AntdListItem>
                  <DisplayExpression symbolIds={distinctVariableRestriction} systemId={systemId} />
                </AntdListItem>
              );
            })}
          </AntdList>
        </AntdCol>
        <AntdCol span={24}>
          <AntdList bordered header='Variable Type Hypotheses'>
            {variableTypeHypotheses.map((variableTypeHypothesis: [string, string]): ReactElement => {
              return (
                <AntdListItem>
                  <DisplayExpression symbolIds={variableTypeHypothesis} systemId={systemId} />
                </AntdListItem>
              );
            })}
          </AntdList>
        </AntdCol>
        <AntdCol span={24}>
          <AntdList bordered header='Logical Hypotheses'>
            {logicalHypotheses.map((logicalHypothesis: string[]): ReactElement => {
              return (
                <AntdListItem>
                  <DisplayExpression symbolIds={logicalHypothesis} systemId={systemId} />
                </AntdListItem>
              );
            })}
          </AntdList>
        </AntdCol>
        <AntdCol span={24}>
          <AntdList bordered header='Assertion'>
            <AntdListItem>
              <DisplayExpression symbolIds={assertion} systemId={systemId} />
            </AntdListItem>
          </AntdList>
        </AntdCol>
      </AntdRow>
    </AntdCard>
  );
};
