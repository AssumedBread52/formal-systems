import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdEmpty } from '@/common/components/antd-empty/antd-empty';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { StatementItem } from '@/statement/components/statement-item/statement-item';
import { Statement } from '@/statement/types/statement';
import { StatementListProps } from '@/statement/types/statement-list-props';
import { ReactElement } from 'react';

export const StatementList = (props: StatementListProps): ReactElement => {
  const { statements } = props;

  if (0 === statements.length) {
    return (
      <AntdEmpty>
        No statements were found matching your search criteria.
      </AntdEmpty>
    );
  }

  return (
    <AntdRow gutter={[0, 16]}>
      {statements.map((statement: Statement): ReactElement => {
        const { id, title, description, systemId, createdByUserId } = statement;

        return (
          <AntdCol key={id} span={24}>
            <StatementItem id={id} title={title} description={description} systemId={systemId} createdByUserId={createdByUserId} />
          </AntdCol>
        );
      })}
    </AntdRow>
  );
};
