import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { System } from '@/system/types/system';
import { ReactElement } from 'react';

export const SystemItem = (props: Omit<System, 'id'>): ReactElement => {
  const { title, urlPath, description, createdByUserId } = props;

  return (
    <AntdCard title={title}>
      {description}
      <AntdDivider />
    </AntdCard>
  );
};
