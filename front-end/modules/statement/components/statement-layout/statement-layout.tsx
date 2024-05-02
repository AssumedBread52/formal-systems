import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { StatementItem } from '@/statement/components/statement-item/statement-item';
import { fetchStatement } from '@/statement/fetch-data/fetch-statement';
import { Metadata } from 'next';
import { PropsWithChildren, ReactElement } from 'react';

export const StatementLayout = async (props: PropsWithChildren<ServerSideProps>): Promise<ReactElement> => {
  const { params, children } = props;

  const { 'system-id': systemId = '', 'statement-id': statementId = '' } = params;

  const { id, title, description, distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion, createdByUserId } = await fetchStatement(systemId, statementId);

  return (
    <AntdCard>
      <StatementItem id={id} title={title} description={description} distinctVariableRestrictions={distinctVariableRestrictions} variableTypeHypotheses={variableTypeHypotheses} logicalHypotheses={logicalHypotheses} assertion={assertion} systemId={systemId} createdByUserId={createdByUserId} />
      <AntdDivider />
      {children}
    </AntdCard>
  );
};

export const generateMetadata = async (props: ServerSideProps): Promise<Metadata> => {
  const { params } = props;

  const { 'system-id': systemId = '', 'statement-id': statementId = '' } = params;

  const { title } = await fetchStatement(systemId, statementId);

  return {
    title
  };
};
