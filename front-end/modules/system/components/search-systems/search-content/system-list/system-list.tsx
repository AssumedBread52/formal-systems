import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdEmpty } from '@/common/components/antd-empty/antd-empty';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { System } from '@/system/types/system';
import { SystemListProps } from '@/system/types/system-list-props';
import { ReactElement } from 'react';
import { SystemItem } from './system-item/system-item';

export const SystemList = (props: SystemListProps): ReactElement => {
  const { systems } = props;

  if (0 === systems.length) {
    return (
      <AntdEmpty>
        No formal systems were found matching your search criteria.
      </AntdEmpty>
    );
  }

  return (
    <AntdRow gutter={[16, 16]}>
      {systems.map((system: System): ReactElement => {
        const { id, title, urlPath, description, createdByUserId } = system;

        return (
          <AntdCol key={id} span={24}>
            <SystemItem title={title} urlPath={urlPath} description={description} createdByUserId={createdByUserId} />
          </AntdCol>
        );
      })}
    </AntdRow>
  );
};
