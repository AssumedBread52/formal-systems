import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { fetchStatement } from '@/statement/fetch-data/fetch-statement';
import { ReactElement } from 'react';

export const StatementPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params } = props;

  const { 'system-id': systemId = '', 'statement-id': statementId = '' } = params;

  const {} = await fetchStatement(systemId, statementId);

  return (
    <AntdCard title='Proof'>
    </AntdCard>
  );
};
