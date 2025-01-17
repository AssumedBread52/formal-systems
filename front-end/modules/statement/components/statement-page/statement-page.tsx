import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdDescriptionsItem } from '@/common/components/antd-descriptions-item/antd-descriptions-item';
import { AntdDescriptions } from '@/common/components/antd-descriptions/antd-descriptions';
import { AntdEmpty } from '@/common/components/antd-empty/antd-empty';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { fetchStatement } from '@/statement/fetch-data/fetch-statement';
import { ReactElement } from 'react';

export const StatementPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params } = props;

  const { 'system-id': systemId = '', 'statement-id': statementId = '' } = params;

  const { proofAppearanceCount, proofCount } = await fetchStatement(systemId, statementId);

  return (
    <AntdRow gutter={[0, 16]}>
      <AntdCol span={24}>
        <AntdCard title='Metrics'>
          <AntdDescriptions bordered>
            <AntdDescriptionsItem label='Proof Appearance Count'>
              {proofAppearanceCount}
            </AntdDescriptionsItem>
            <AntdDescriptionsItem label='Proof Count'>
              {proofCount}
            </AntdDescriptionsItem>
          </AntdDescriptions>
        </AntdCard>
      </AntdCol>
      <AntdCol span={24}>
        <AntdCard title='Proof'>
          <AntdEmpty description='Proof does not exist.' />
        </AntdCard>
      </AntdCol>
    </AntdRow>
  );
};
