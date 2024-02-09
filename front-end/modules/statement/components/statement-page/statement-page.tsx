import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { StatementItem } from '@/statement/components/statement-item/statement-item';
import { fetchStatement } from '@/statement/fetch-data/fetch-statement';
import { Metadata } from 'next';
import { ReactElement } from 'react';

export const StatementPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params } = props;

  const { 'system-id': systemId = '', 'statement-id': statementId = '' } = params;

  const { id, title, description, createdByUserId } = await fetchStatement(systemId, statementId);

  return (
    <AntdCard>
      <StatementItem id={id} title={title} description={description} systemId={systemId} createdByUserId={createdByUserId} />
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
